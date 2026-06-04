import { getUncachableStripeClient, getWebhookSecret } from './stripeClient';
import { PRODUCTS, ORDER_BUMP_PRODUCT, ORDER_BUMP_ID } from './productData';
import { sendOrderConfirmation, scheduleLogisticsSequence } from './email/emailService';
import type { OrderInfo } from './email/templates';
import { resolveLocale } from './email/templates';
import { createHash } from 'crypto';
import { db } from '@workspace/db';
import { sql } from 'drizzle-orm';

const FB_PIXEL_ID = '1622885129012772';
const FB_API_VERSION = 'v18.0';
const UTMIFY_API_URL = 'https://api.utmify.com.br/api-credentials/orders';

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

// Ensure idempotency table exists (runs once at module load)
async function ensureIdempotencyTable(): Promise<void> {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS processed_webhook_events (
        event_id TEXT PRIMARY KEY,
        processed_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  } catch (err) {
    console.warn('[webhook] Could not create idempotency table:', err);
  }
}
ensureIdempotencyTable();

async function isAlreadyProcessed(eventId: string): Promise<boolean> {
  try {
    const result = await db.execute(
      sql`SELECT 1 FROM processed_webhook_events WHERE event_id = ${eventId} LIMIT 1`
    );
    return (result.rows?.length ?? 0) > 0;
  } catch {
    return false; // if DB check fails, allow processing (fail-open)
  }
}

async function markAsProcessed(eventId: string): Promise<void> {
  try {
    await db.execute(
      sql`INSERT INTO processed_webhook_events (event_id) VALUES (${eventId}) ON CONFLICT DO NOTHING`
    );
  } catch (err) {
    console.warn('[webhook] Could not mark event as processed:', err);
  }
}

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const secret = getWebhookSecret();
    if (!secret) {
      console.warn('[webhook] No webhook secret configured, skipping verification');
      return;
    }

    const stripe = await getUncachableStripeClient();
    const event = stripe.webhooks.constructEvent(payload, signature, secret);

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as any;
      const idempotencyKey = `pi_succeeded_${pi.id}`;

      if (await isAlreadyProcessed(idempotencyKey)) {
        console.log(`[webhook] Skipping duplicate event for PI ${pi.id} (already processed)`);
        return;
      }

      // Mark BEFORE processing so concurrent retries are blocked immediately
      await markAsProcessed(idempotencyKey);

      await Promise.all([
        WebhookHandlers.handlePaymentIntentSucceeded(pi),
        WebhookHandlers.firePurchaseCapi(pi),
        WebhookHandlers.fireUTMifyOrder(pi),
        WebhookHandlers.createSubscriptionForOrder(pi),
      ]);
    }
  }

  private static async handlePaymentIntentSucceeded(pi: any): Promise<void> {
    try {
      const customerEmail: string = pi.receipt_email || pi.customer_email || '';
      if (!customerEmail) {
        console.warn('[webhook] payment_intent.succeeded: no customer email found, skipping email sequence');
        return;
      }

      const locale = resolveLocale(pi.metadata?.locale);

      const cartItemsRaw: string = pi.metadata?.cart_items || '[]';
      let cartItems: { productId: string; quantity: number }[] = [];
      try {
        cartItems = JSON.parse(cartItemsRaw);
      } catch {
        console.warn('[webhook] Failed to parse cart_items metadata');
      }

      const resolvedItems = cartItems
        .map(ci => {
          const product = PRODUCTS.find(p => p.id === ci.productId);
          if (!product) return null;
          const localeKey = locale as keyof typeof product.translations;
          const name = product.translations[localeKey]?.name || product.translations['pt-BR'].name;
          return {
            name,
            quantity: ci.quantity,
            price: product.price / 100,
          };
        })
        .filter((i): i is { name: string; quantity: number; price: number } => i !== null);

      const shippingAddr = pi.shipping
        ? [
            pi.shipping.address?.line1,
            pi.shipping.address?.line2,
            pi.shipping.address?.city,
            pi.shipping.address?.state,
            pi.shipping.address?.country,
          ]
            .filter(Boolean)
            .join(', ')
        : undefined;

      const order: OrderInfo = {
        customerEmail,
        customerName: pi.shipping?.name || undefined,
        orderId: pi.id,
        items: resolvedItems,
        totalAmount: pi.amount / 100,
        currency: pi.currency || 'eur',
        shippingAddress: shippingAddr,
        locale,
      };

      await sendOrderConfirmation(order);
      await scheduleLogisticsSequence(order);
    } catch (err) {
      console.error('[webhook] Error handling payment_intent.succeeded:', err);
    }
  }

  static async fireUTMifyOrder(pi: any): Promise<void> {
    const apiToken = process.env.VITE_UTMIFY_TOKEN;
    if (!apiToken) {
      console.warn('[webhook] VITE_UTMIFY_TOKEN not set — skipping UTMify order');
      return;
    }

    try {
      const customerEmail: string = pi.receipt_email || pi.customer_email || '';
      const customerName: string = pi.shipping?.name || '';
      const orderValueEurCents = pi.amount; // in EUR cents (e.g. 5700 = €57.00)

      // Map Stripe payment method to UTMify's paymentMethod enum
      const stripeMethod = (pi.payment_method_types?.[0] || 'card') as string;
      const paymentMethod = stripeMethod === 'pix' ? 'pix' : 'credit_card';

      // Read UTM parameters from PI metadata (stored at checkout time by the frontend)
      const utmSource = pi.metadata?.utm_source || null;
      const utmMedium = pi.metadata?.utm_medium || null;
      const utmCampaign = pi.metadata?.utm_campaign || null;
      const utmContent = pi.metadata?.utm_content || null;
      const utmTerm = pi.metadata?.utm_term || null;

      // Fetch the balance_transaction from the latest charge to get the BRL amount.
      // The UTMify dashboard is configured in BRL, so we must send the Stripe-converted
      // BRL value (e.g. €57 EUR → R$336.08 BRL) rather than the raw EUR amount.
      let totalBrlCents = orderValueEurCents; // will be overwritten below
      let utmifyCurrency = 'BRL'; // UTMify dashboard is always in BRL
      let brlResolved = false;

      const stripe = await getUncachableStripeClient();
      if (pi.latest_charge) {
        try {
          const charge = await stripe.charges.retrieve(pi.latest_charge as string, {
            expand: ['balance_transaction'],
          });
          const bt = charge.balance_transaction as any;

          if (bt && bt.currency === 'brl' && bt.amount > 0) {
            // Level 1 (best): Stripe settled this charge in BRL — exact amount
            totalBrlCents = bt.amount;
            brlResolved = true;
            console.log(`[webhook] UTMify BRL [L1-exact]: €${(orderValueEurCents/100).toFixed(2)} → R$${(totalBrlCents/100).toFixed(2)}`);
          } else if (bt && bt.exchange_rate > 0) {
            // Level 2: Stripe settled in EUR but provided exchange_rate for this transaction
            totalBrlCents = Math.round(orderValueEurCents * bt.exchange_rate);
            brlResolved = true;
            console.log(`[webhook] UTMify BRL [L2-rate ${bt.exchange_rate}]: €${(orderValueEurCents/100).toFixed(2)} → R$${(totalBrlCents/100).toFixed(2)}`);
          }
        } catch (btErr) {
          console.warn('[webhook] Could not fetch balance_transaction:', btErr);
        }
      }

      if (!brlResolved) {
        // Level 3 (last resort): Stripe account settles in EUR with no exchange_rate field —
        // fetch current EUR/BRL spot rate from a free public API (no key required)
        try {
          const rateRes = await fetch('https://open.er-api.com/v6/latest/EUR');
          if (rateRes.ok) {
            const rateData = await rateRes.json() as { rates?: { BRL?: number } };
            const eurBrl = rateData?.rates?.BRL;
            if (eurBrl && eurBrl > 0) {
              totalBrlCents = Math.round(orderValueEurCents * eurBrl);
              console.log(`[webhook] UTMify BRL [L3-er-api rate ${eurBrl}]: €${(orderValueEurCents/100).toFixed(2)} → R$${(totalBrlCents/100).toFixed(2)}`);
            } else {
              console.warn('[webhook] UTMify BRL [L3]: no BRL rate in er-api response — sending EUR amount as fallback');
            }
          } else {
            console.warn('[webhook] UTMify BRL [L3]: er-api returned', rateRes.status, '— sending EUR amount as fallback');
          }
        } catch (rateErr) {
          console.warn('[webhook] UTMify BRL [L3]: rate fetch failed —', rateErr);
        }
      }

      // Resolve cart items from metadata
      const cartItemsRaw: string = pi.metadata?.cart_items || '[]';
      let cartItems: { productId: string; quantity: number }[] = [];
      try { cartItems = JSON.parse(cartItemsRaw); } catch { /* ignore */ }

      // Distribute totalBrlCents proportionally across products based on their
      // share of the total EUR amount. This avoids using a fixed exchange rate —
      // the only source of truth is the balance_transaction BRL total from Stripe.
      const totalEurCents = cartItems.reduce((sum, ci) => {
        const product = PRODUCTS.find(p => p.id === ci.productId);
        return sum + (product?.price ?? 0) * ci.quantity;
      }, 0);
      const orderBumpId = pi.metadata?.order_bump || '';
      const totalEurWithBump = totalEurCents + (orderBumpId === ORDER_BUMP_ID ? ORDER_BUMP_PRODUCT.price : 0);
      const totalEurBase = totalEurWithBump > 0 ? totalEurWithBump : orderValueEurCents;

      // Proportional conversion: product_brl = round(totalBrl * product_eur / total_eur)
      const toBrl = (eurCents: number) =>
        totalEurBase > 0 ? Math.round(totalBrlCents * eurCents / totalEurBase) : eurCents;

      const products = cartItems.map(ci => {
        const product = PRODUCTS.find(p => p.id === ci.productId);
        const name = product?.translations?.['pt-BR']?.name || ci.productId;
        const eurCents = (product?.price ?? 0) * ci.quantity;
        return {
          id: ci.productId,
          planId: ci.productId,
          planName: name,
          name,
          quantity: ci.quantity,
          priceInCents: toBrl(eurCents),
        };
      });

      if (products.length === 0) {
        // Fallback when cart metadata is unavailable
        products.push({
          id: 'panini-wc2026',
          planId: 'panini-wc2026',
          planName: 'Panini FIFA World Cup 2026',
          name: 'Panini FIFA World Cup 2026',
          quantity: 1,
          priceInCents: totalBrlCents,
        });
      }

      // Include order bump if selected
      if (orderBumpId === ORDER_BUMP_ID) {
        products.push({
          id: ORDER_BUMP_PRODUCT.id,
          planId: ORDER_BUMP_PRODUCT.id,
          planName: ORDER_BUMP_PRODUCT.translations['pt-BR'].name,
          name: ORDER_BUMP_PRODUCT.translations['pt-BR'].name,
          quantity: 1,
          priceInCents: toBrl(ORDER_BUMP_PRODUCT.price),
        });
      }

      const now = new Date().toISOString();

      const payload = {
        orderId: pi.id,
        platform: 'other',
        paymentMethod,
        status: 'paid',
        currency: utmifyCurrency,
        createdAt: now,
        approvedDate: now,
        customer: {
          name: customerName || customerEmail,
          email: customerEmail,
          phone: null,
          document: null,
        },
        trackingParameters: {
          utm_source: utmSource || null,
          utm_medium: utmMedium || null,
          utm_campaign: utmCampaign || null,
          utm_content: utmContent || null,
          utm_term: utmTerm || null,
        },
        commission: {
          totalPriceInCents: totalBrlCents,
          gatewayFeeInCents: 0,
          userCommissionInCents: totalBrlCents,
        },
        products,
      };

      const res = await fetch(UTMIFY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': apiToken,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.OK) {
        console.log(`[webhook] UTMify order registered for PI ${pi.id}:`, JSON.stringify(result));
      } else {
        console.error(`[webhook] UTMify order failed for PI ${pi.id}:`, JSON.stringify(result));
      }
    } catch (err) {
      console.error('[webhook] UTMify order error:', err);
    }
  }

  static async firePurchaseCapi(pi: any): Promise<void> {
    const accessToken = process.env.FB_CAPI_ACCESS_TOKEN;
    if (!accessToken) return;

    try {
      const customerEmail: string = pi.receipt_email || pi.customer_email || '';
      const firstName: string = pi.shipping?.name?.split(' ')[0] || '';
      const lastName: string = pi.shipping?.name?.split(' ').slice(1).join(' ') || '';
      const country: string = pi.shipping?.address?.country || '';
      const orderValue = pi.amount / 100;
      const eventId = `purchase_${pi.id}`;

      const userData: Record<string, string[]> = {};
      if (customerEmail) userData.em = [sha256(customerEmail)];
      if (firstName) userData.fn = [sha256(firstName)];
      if (lastName) userData.ln = [sha256(lastName)];
      if (country) userData.country = [sha256(country.toLowerCase())];

      const payload = {
        data: [
          {
            event_name: 'Purchase',
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'website',
            event_id: eventId,
            user_data: userData,
            custom_data: {
              value: orderValue,
              // Facebook requires uppercase ISO 4217 currency codes (EUR not eur)
              currency: (pi.currency || 'eur').toUpperCase(),
              content_type: 'product',
            },
          },
        ],
      };

      const res = await fetch(
        `https://graph.facebook.com/${FB_API_VERSION}/${FB_PIXEL_ID}/events?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const result = await res.json();
      console.log('[webhook] CAPI Purchase sent:', JSON.stringify(result));
    } catch (err) {
      console.error('[webhook] CAPI Purchase error:', err);
    }
  }

  /**
   * Creates a monthly Stripe subscription for the order, with a 7-day free trial.
   * The subscription amount mirrors the one-time order total (pi.amount in EUR).
   *
   * Requirements:
   *  - A Stripe Customer must be attached to the PI (created at checkout time).
   *  - The payment method used for the PI must be attached to the customer
   *    (guaranteed by setup_future_usage: 'off_session' on the PI).
   */
  static async createSubscriptionForOrder(pi: any): Promise<void> {
    try {
      const stripe = await getUncachableStripeClient();

      // Guard 1: Skip upsell PIs — they have upsell_product_id in metadata
      if (pi.metadata?.upsell_product_id) {
        console.log(`[subscription] Skipping upsell PI ${pi.id} — no subscription for upsells`);
        return;
      }

      // 1. Resolve Stripe Customer ID
      let customerId: string | undefined = typeof pi.customer === 'string' ? pi.customer : undefined;

      if (!customerId) {
        // Try to find customer by email
        const email: string = pi.receipt_email || pi.customer_email || '';
        if (email) {
          const existing = await stripe.customers.list({ email: email.trim(), limit: 1 });
          customerId = existing.data[0]?.id;
        }
      }

      if (!customerId) {
        console.warn(`[subscription] No Stripe Customer found for PI ${pi.id} — skipping subscription creation`);
        return;
      }

      // Guard 2: Only one subscription per customer — skip if they already have one
      const existingSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 10,
      });
      const hasActiveSub = existingSubs.data.some(s =>
        ['active', 'trialing', 'past_due'].includes(s.status)
      );
      if (hasActiveSub) {
        console.log(`[subscription] Customer ${customerId} already has a subscription — skipping for PI ${pi.id}`);
        return;
      }

      // 2. Resolve payment method: prefer the one attached to the PI (off_session save),
      //    fall back to customer's default payment method.
      let paymentMethodId: string | undefined =
        typeof pi.payment_method === 'string' ? pi.payment_method : undefined;

      if (!paymentMethodId) {
        const customer = await stripe.customers.retrieve(customerId) as any;
        paymentMethodId = customer.invoice_settings?.default_payment_method
          || customer.default_source
          || undefined;
      }

      if (!paymentMethodId) {
        // Last resort: first saved payment method on the customer
        const pms = await stripe.paymentMethods.list({ customer: customerId, type: 'card', limit: 1 });
        paymentMethodId = pms.data[0]?.id;
      }

      if (!paymentMethodId) {
        console.warn(`[subscription] No payment method found for customer ${customerId} — skipping subscription`);
        return;
      }

      // Ensure the payment method is set as customer's default (required for subscription invoices)
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });

      // 3. Create subscription with inline price (same EUR amount as the order), monthly, 7-day trial
      const amountEurCents: number = pi.amount; // e.g. 5700 for €57.00
      const idempotencyKey = `sub_create_${pi.id}`;

      const subscription = await stripe.subscriptions.create(
        {
          customer: customerId,
          items: [
            {
              price_data: {
                currency: 'eur',
                product_data: {
                  name: 'Panini FIFA World Cup 2026 — Assinatura Mensal',
                },
                recurring: { interval: 'month' },
                unit_amount: amountEurCents,
              },
            },
          ],
          trial_period_days: 7,
          default_payment_method: paymentMethodId,
          metadata: {
            origin_payment_intent: pi.id,
            cart_items: pi.metadata?.cart_items || '',
          },
        },
        { idempotencyKey }
      );

      console.log(
        `[subscription] Created subscription ${subscription.id} for customer ${customerId}` +
        ` — €${(amountEurCents / 100).toFixed(2)}/month, trial ends ${new Date((subscription.trial_end ?? 0) * 1000).toISOString()}`
      );
    } catch (err) {
      // Non-fatal: log and continue — the purchase itself already succeeded
      console.error('[subscription] Failed to create subscription for PI', pi.id, ':', err);
    }
  }
}
