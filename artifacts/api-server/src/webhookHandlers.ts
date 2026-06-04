import { getUncachableStripeClient, getWebhookSecret } from './stripeClient';
import { PRODUCTS } from './productData';
import { sendOrderConfirmation, scheduleLogisticsSequence } from './email/emailService';
import type { OrderInfo } from './email/templates';
import { resolveLocale } from './email/templates';
import { createHash } from 'crypto';
import { db } from '@workspace/db';
import { sql } from 'drizzle-orm';

const FB_PIXEL_ID = '1622885129012772';
const FB_API_VERSION = 'v18.0';

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
