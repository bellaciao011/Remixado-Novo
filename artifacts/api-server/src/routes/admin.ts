import { Router, Request, Response } from 'express';
import { getUncachableStripeClient } from '../stripeClient';
import { db } from '@workspace/db';
import { paymentsTable } from '@workspace/db';
import { sql, desc, eq, and, gte, lte, count as drizzleCount } from 'drizzle-orm';

const router = Router();

function piToPayment(pi: any) {
  let cartItems = null;
  try { cartItems = JSON.parse(pi.metadata?.cart_items || 'null'); } catch {}
  return {
    id: pi.id,
    amount: pi.amount,
    amountReceived: pi.amount_received ?? null,
    currency: pi.currency || 'usd',
    status: pi.status,
    livemode: pi.livemode ?? false,
    createdAt: new Date(pi.created * 1000),
    customerId: typeof pi.customer === 'string' ? pi.customer : (pi.customer?.id ?? null),
    customerEmail: pi.metadata?.customer_real_email || null,
    customerName: pi.shipping?.name || null,
    receiptEmail: pi.receipt_email || null,
    cartItems: cartItems,
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
}

router.post('/admin/stripe-sync', async (_req: Request, res: Response): Promise<void> => {
  try {
    const stripe = await getUncachableStripeClient();
    let synced = 0;
    let hasMore = true;
    let startingAfter: string | undefined = undefined;

    while (hasMore) {
      const params: any = { limit: 100, expand: [] };
      if (startingAfter) params.starting_after = startingAfter;

      const page = await stripe.paymentIntents.list(params);

      if (page.data.length === 0) break;

      const rows = page.data.map(piToPayment);

      await db
        .insert(paymentsTable)
        .values(rows)
        .onConflictDoUpdate({
          target: paymentsTable.id,
          set: {
            amount: sql`excluded.amount`,
            amountReceived: sql`excluded.amount_received`,
            status: sql`excluded.status`,
            livemode: sql`excluded.livemode`,
            customerEmail: sql`excluded.customer_email`,
            customerName: sql`excluded.customer_name`,
            receiptEmail: sql`excluded.receipt_email`,
            cartItems: sql`excluded.cart_items`,
            orderBump: sql`excluded.order_bump`,
            orderBump2: sql`excluded.order_bump_2`,
            utmSource: sql`excluded.utm_source`,
            utmMedium: sql`excluded.utm_medium`,
            utmCampaign: sql`excluded.utm_campaign`,
            utmContent: sql`excluded.utm_content`,
            utmTerm: sql`excluded.utm_term`,
            locale: sql`excluded.locale`,
            lastPaymentError: sql`excluded.last_payment_error`,
            shipping: sql`excluded.shipping`,
            paymentMethod: sql`excluded.payment_method`,
            syncedAt: sql`excluded.synced_at`,
          },
        });

      synced += rows.length;
      hasMore = page.has_more;
      if (page.data.length > 0) {
        startingAfter = page.data[page.data.length - 1].id;
      }
    }

    res.json({ ok: true, synced });
  } catch (error: any) {
    console.error('[admin] stripe-sync error:', error);
    res.status(500).json({ error: error.message || 'Sync failed' });
  }
});

router.get('/admin/transactions', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '50',
      status,
      livemode,
      from,
      to,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit) || 50));
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];
    if (status) conditions.push(eq(paymentsTable.status, status));
    if (livemode !== undefined) conditions.push(eq(paymentsTable.livemode, livemode === 'true'));
    if (from) conditions.push(gte(paymentsTable.createdAt, new Date(from)));
    if (to) conditions.push(lte(paymentsTable.createdAt, new Date(to)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      db
        .select()
        .from(paymentsTable)
        .where(where)
        .orderBy(desc(paymentsTable.createdAt))
        .limit(limitNum)
        .offset(offset),
      db
        .select({ count: drizzleCount() })
        .from(paymentsTable)
        .where(where),
    ]);

    const total = totalResult[0]?.count ?? 0;

    res.json({
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(Number(total) / limitNum),
      },
    });
  } catch (error: any) {
    console.error('[admin] transactions error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch transactions' });
  }
});

router.get('/admin/transactions/summary', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE livemode = true) AS total_live,
        COUNT(*) FILTER (WHERE livemode = true AND status = 'succeeded') AS succeeded_live,
        COUNT(*) FILTER (WHERE livemode = true AND status NOT IN ('succeeded','canceled')) AS pending_live,
        COUNT(*) FILTER (WHERE livemode = true AND status = 'canceled') AS canceled_live,
        COALESCE(SUM(amount_received) FILTER (WHERE livemode = true AND status = 'succeeded'), 0) AS total_revenue_cents,
        COUNT(*) FILTER (WHERE livemode = false) AS total_test,
        COUNT(*) FILTER (WHERE livemode = false AND status = 'succeeded') AS succeeded_test
      FROM payments
    `);
    res.json(result.rows[0] || {});
  } catch (error: any) {
    console.error('[admin] summary error:', error);
    res.status(500).json({ error: error.message || 'Failed to get summary' });
  }
});

export default router;
