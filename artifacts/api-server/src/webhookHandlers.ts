import { getUncachableStripeClient, getWebhookSecret } from './stripeClient';
import { db } from '@workspace/db';
import { paymentsTable } from '@workspace/db';
import { sql } from 'drizzle-orm';

async function upsertPayment(pi: any): Promise<void> {
  try {
    let cartItems = null;
    try { cartItems = JSON.parse(pi.metadata?.cart_items || 'null'); } catch {}
    const row = {
      id: pi.id,
      amount: pi.amount,
      amountReceived: pi.amount_received ?? null,
      currency: pi.currency || 'eur',
      status: pi.status,
      livemode: pi.livemode ?? false,
      createdAt: new Date(pi.created * 1000),
      customerId: typeof pi.customer === 'string' ? pi.customer : (pi.customer?.id ?? null),
      customerEmail: pi.metadata?.customer_real_email || null,
      customerName: pi.shipping?.name || null,
      receiptEmail: pi.receipt_email || null,
      cartItems,
      orderBump: pi.metadata?.order_bump || null,
      orderBump2: pi.metadata?.order_bump_2 || null,
      utmSource: pi.metadata?.utm_source || null,
      utmMedium: pi.metadata?.utm_medium || null,
      utmCampaign: pi.metadata?.utm_campaign || null,
      utmContent: pi.metadata?.utm_content || null,
      utmTerm: pi.metadata?.utm_term || null,
      locale: pi.metadata?.locale || null,
      lastPaymentError: pi.last_payment_error?.message || null,
      shipping: pi.shipping || null,
      paymentMethod: typeof pi.payment_method === 'string' ? pi.payment_method : (pi.payment_method?.id ?? null),
      syncedAt: new Date(),
    };
    await db
      .insert(paymentsTable)
      .values(row)
      .onConflictDoUpdate({
        target: paymentsTable.id,
        set: {
          amount: sql`excluded.amount`,
          amountReceived: sql`excluded.amount_received`,
          status: sql`excluded.status`,
          customerEmail: sql`excluded.customer_email`,
          customerName: sql`excluded.customer_name`,
          receiptEmail: sql`excluded.receipt_email`,
          cartItems: sql`excluded.cart_items`,
          orderBump: sql`excluded.order_bump`,
          orderBump2: sql`excluded.order_bump_2`,
          lastPaymentError: sql`excluded.last_payment_error`,
          shipping: sql`excluded.shipping`,
          paymentMethod: sql`excluded.payment_method`,
          syncedAt: sql`excluded.synced_at`,
        },
      });
  } catch (err) {
    console.error('[webhook] upsertPayment error:', err);
  }
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
    return false;
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
      await upsertPayment(pi);

      const eventKey = `pi_succeeded_${pi.id}`;
      const alreadyDone = await isAlreadyProcessed(eventKey);
      if (alreadyDone) {
        console.log(`[webhook] PI ${pi.id} already processed — skipping`);
        return;
      }
      await markAsProcessed(eventKey);
      console.log(`[webhook] PI ${pi.id} succeeded — payment recorded`);
    } else if (
      event.type === 'payment_intent.payment_failed' ||
      event.type === 'payment_intent.canceled' ||
      event.type === 'payment_intent.created' ||
      event.type === 'payment_intent.processing'
    ) {
      const pi = event.data.object as any;
      await upsertPayment(pi);
    }
  }
}
