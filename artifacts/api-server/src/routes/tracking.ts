import { Router, Request, Response } from 'express';
import { createHash } from 'crypto';
import { getUncachableStripeClient } from '../stripeClient';
import { PRODUCTS } from '../productData';
import { getResendClient } from '../email/resendClient';
import { db } from '@workspace/db';
import { sql } from 'drizzle-orm';

const router = Router();
const FB_API_VERSION = 'v18.0';
const SUPPORT_EMAIL = 'panini@confirmedorder.site';
const FROM_ADDRESS = 'Panini FIFA World Cup 2026 <noreply@confirmedorder.site>';

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

// ── Facebook CAPI proxy ──────────────────────────────────────────────────────
router.post('/tracking/event', async (req: Request, res: Response): Promise<void> => {
  const accessToken = process.env.FB_CAPI_ACCESS_TOKEN;
  const pixelId = process.env.FB_PIXEL_ID;

  if (!accessToken || !pixelId) {
    res.status(200).json({ ok: false, reason: 'no_token' });
    return;
  }

  const {
    eventName, email, firstName, lastName, country,
    value, currency, contentIds, numItems, eventSourceUrl, eventId,
  } = req.body;

  const userData: Record<string, string[]> = {};
  if (email && typeof email === 'string') userData.em = [sha256(email)];
  if (firstName && typeof firstName === 'string') userData.fn = [sha256(firstName)];
  if (lastName && typeof lastName === 'string') userData.ln = [sha256(lastName)];
  if (country && typeof country === 'string') userData.country = [sha256(country.toLowerCase())];

  const customData: Record<string, unknown> = {};
  if (typeof value === 'number') customData.value = value;
  if (typeof currency === 'string') customData.currency = currency.toUpperCase();
  if (Array.isArray(contentIds) && contentIds.length > 0) customData.content_ids = contentIds;
  if (typeof numItems === 'number') customData.num_items = numItems;
  customData.content_type = 'product';

  const payload = {
    data: [{
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: eventSourceUrl || '',
      ...(eventId ? { event_id: eventId } : {}),
      user_data: userData,
      custom_data: customData,
    }],
  };

  try {
    const fbRes = await fetch(
      `https://graph.facebook.com/${FB_API_VERSION}/${pixelId}/events?access_token=${accessToken}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );
    const fbData = await fbRes.json();
    res.status(200).json({ ok: fbRes.ok, result: fbData });
  } catch (err: any) {
    res.status(200).json({ ok: false, error: err.message });
  }
});

// ── Order tracking lookup ────────────────────────────────────────────────────
router.get('/orders/track/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };

  if (!id) {
    res.status(400).json({ error: 'Bestellcode fehlt.' });
    return;
  }

  try {
    // Resolve PI id — accept both PAN codes and raw pi_ ids
    let piId: string;
    if (id.startsWith('PAN')) {
      try {
        const row = await db.execute(
          sql`SELECT id FROM payments WHERE tracking_code = ${id} LIMIT 1`
        );
        if (!row.rows || row.rows.length === 0) {
          res.status(404).json({ error: 'Bestellung nicht gefunden. Bitte prüfen Sie den Bestellcode.' });
          return;
        }
        piId = row.rows[0].id as string;
      } catch (dbErr: any) {
        console.warn('[tracking] DB lookup failed, DB may be unavailable:', dbErr?.message);
        res.status(503).json({ error: 'Datenbank temporär nicht verfügbar. Bitte versuchen Sie es später erneut.' });
        return;
      }
    } else if (id.startsWith('pi_')) {
      piId = id;
    } else {
      res.status(400).json({ error: 'Ungültiger Bestellcode. Der Code beginnt mit PAN oder pi_.' });
      return;
    }

    const stripe = await getUncachableStripeClient();
    const pi = await stripe.paymentIntents.retrieve(piId);

    // Parse cart items and resolve product names
    let cartItems: { productId: string; quantity: number }[] = [];
    try { cartItems = JSON.parse(pi.metadata?.cart_items || '[]'); } catch { /* ignore */ }

    const items = cartItems
      .map(ci => {
        const product = PRODUCTS.find(p => p.id === ci.productId);
        if (!product) return null;
        const name =
          product.translations?.['de']?.name ||
          product.translations?.['en']?.name ||
          product.translations?.['pt-BR']?.name ||
          ci.productId;
        return { name, quantity: ci.quantity, price: product.price / 100 };
      })
      .filter((i): i is { name: string; quantity: number; price: number } => i !== null);

    res.json({
      orderId: pi.id,
      status: pi.status,
      customerName: pi.shipping?.name || pi.metadata?.customer_name || null,
      amount: pi.amount / 100,
      currency: pi.currency || 'usd',
      paidAt: pi.status === 'succeeded' ? new Date(pi.created * 1000).toISOString() : null,
      items,
    });
  } catch (err: any) {
    if (err?.raw?.code === 'resource_missing' || err?.statusCode === 404) {
      res.status(404).json({ error: 'Bestellung nicht gefunden. Bitte prüfen Sie den Bestellcode.' });
    } else {
      console.error('[tracking] Error retrieving order:', err?.message);
      res.status(500).json({ error: 'Fehler beim Abrufen der Bestellung.' });
    }
  }
});

// ── Support form submission ──────────────────────────────────────────────────
router.post('/public/support', async (req: Request, res: Response): Promise<void> => {
  const { fullName, orderId, email, message, option } = req.body as {
    fullName?: string; orderId?: string; email?: string; message?: string; option?: string;
  };

  if (!fullName?.trim() || !email?.trim() || !message?.trim()) {
    res.status(400).json({ error: 'Pflichtfelder fehlen: fullName, email, message' });
    return;
  }

  const optionLabels: Record<string, string> = {
    follow_up: 'Bestellung weiterverfolgen',
    priority: 'Prioritätsaktualisierung erhalten',
    refund: 'Rückerstattungsanalyse beantragen',
  };
  const optionLabel = optionLabels[option || ''] || option || '—';

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:30px 0;">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">
    <tr><td style="background:#FFD600;padding:20px 28px;">
      <strong style="font-size:16px;color:#1a1a1a;">Panini WC2026 — Support-Anfrage</strong>
    </td></tr>
    <tr><td style="padding:28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;font-size:14px;color:#555;"><strong>Name:</strong> ${fullName}</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#555;"><strong>E-Mail:</strong> ${email}</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#555;"><strong>Bestellnummer:</strong> ${orderId || '—'}</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#555;"><strong>Option:</strong> ${optionLabel}</td></tr>
        <tr><td style="padding:12px 0 6px;font-size:14px;color:#555;"><strong>Nachricht:</strong></td></tr>
        <tr><td style="padding:10px 14px;background:#f9f9f9;border-left:3px solid #FFD600;font-size:14px;color:#333;border-radius:2px;">${message.replace(/\n/g, '<br>')}</td></tr>
      </table>
    </td></tr>
    <tr><td style="background:#1a1a1a;padding:16px 28px;text-align:center;">
      <span style="font-size:12px;color:#999;">© 2026 Panini FIFA World Cup 2026</span>
    </td></tr>
  </table>
</body></html>`;

  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject: `Support-Anfrage: ${orderId || 'kein Code'} — ${fullName}`,
      html,
    });
    res.json({ ok: true });
  } catch (err: any) {
    console.error('[support] Failed to send support email:', err?.message);
    res.status(500).json({ error: 'E-Mail konnte nicht gesendet werden.' });
  }
});

export default router;
