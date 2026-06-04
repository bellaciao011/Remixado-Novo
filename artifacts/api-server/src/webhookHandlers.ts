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
      const orderValue = pi.amount; // in cents

      // Map Stripe payment method to UTMify's paymentMethod enum
      const stripeMethod = (pi.payment_method_types?.[0] || 'card') as string;
      const paymentMethod = stripeMethod === 'pix' ? 'pix' : 'credit_card';

      // Read UTM parameters from PI metadata (stored at checkout time by the frontend)
      const utmSource = pi.metadata?.utm_source || null;
      const utmMedium = pi.metadata?.utm_medium || null;
      const utmCampaign = pi.metadata?.utm_campaign || null;
      const utmContent = pi.metadata?.utm_content || null;
      const utmTerm = pi.metadata?.utm_term || null;

      // Resolve cart items from metadata
      const cartItemsRaw: string = pi.metadata?.cart_items || '[]';
      let cartItems: { productId: string; quantity: number }[] = [];
      try { cartItems = JSON.parse(cartItemsRaw); } catch { /* ignore */ }

      const products = cartItems.map(ci => {
        const product = PRODUCTS.find(p => p.id === ci.productId);
        const name = product?.translations?.['pt-BR']?.name || ci.productId;
        return {
          id: ci.productId,
          planId: ci.productId,
          planName: name,
          name,
          quantity: ci.quantity,
          priceInCents: (product?.price ?? 0) * ci.quantity,
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
          priceInCents: orderValue,
        });
      }

      // Include order bump if it was selected (stored in metadata by PUT /payment-intent/:id)
      const orderBumpId = pi.metadata?.order_bump || '';
      if (orderBumpId === ORDER_BUMP_ID) {
        products.push({
          id: ORDER_BUMP_PRODUCT.id,
          planId: ORDER_BUMP_PRODUCT.id,
          planName: ORDER_BUMP_PRODUCT.translations['pt-BR'].name,
          name: ORDER_BUMP_PRODUCT.translations['pt-BR'].name,
          quantity: 1,
          priceInCents: ORDER_BUMP_PRODUCT.price,
        });
      }

      const now = new Date().toISOString();

      const payload = {
        orderId: pi.id,
        platform: 'other',
        paymentMethod,
        status: 'paid',
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
          totalPriceInCents: orderValue,
          gatewayFeeInCents: 0,
          userCommissionInCents: orderValue,
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
}
