import { Router, Request, Response } from 'express';
import { createWayMBTransaction, getWayMBTransactionInfo } from '../waymb';
import { PRODUCTS, ORDER_BUMP_PRODUCT, ORDER_BUMP_ID } from '../productData';
import { sendOrderConfirmation, scheduleLogisticsSequence } from '../email/emailService';
import type { OrderInfo } from '../email/templates';
import { resolveLocale } from '../email/templates';
import { createHash } from 'crypto';
import { db } from '@workspace/db';
import { paymentsTable } from '@workspace/db';
import { sql } from 'drizzle-orm';

const UTMIFY_API_URL = 'https://api.utmify.com.br/api-credentials/orders';

function generateTrackingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'PAN';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

async function eurToBrl(eurCents: number): Promise<number> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/EUR');
    if (res.ok) {
      const data = await res.json() as { rates?: { BRL?: number } };
      const rate = data?.rates?.BRL;
      if (rate && rate > 0) return Math.round(eurCents * rate);
    }
  } catch { /* fallback below */ }
  return Math.round(eurCents * 6.1);
}

const router = Router();

// POST /api/waymb/checkout — criar transação WayMB
router.post('/waymb/checkout', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      items, email, firstName, lastName, method, nif, phone,
      addOrderBump, locale, utmSource, utmMedium, utmCampaign, utmContent, utmTerm,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Items são obrigatórios' });
      return;
    }

    if (!method || !['multibanco', 'mbway'].includes(method)) {
      res.status(400).json({ error: 'Método de pagamento inválido (multibanco ou mbway)' });
      return;
    }

    if (method === 'mbway' && (!phone || typeof phone !== 'string' || !phone.trim())) {
      res.status(400).json({ error: 'Telemóvel é obrigatório para MB WAY' });
      return;
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Email inválido' });
      return;
    }

    let amountTotalCents = 0;
    const cartItems: { productId: string; quantity: number }[] = [];

    for (const item of items as { productId: string; quantity: number }[]) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        res.status(400).json({ error: 'Cada item requer productId e quantity >= 1' });
        return;
      }
      const product = PRODUCTS.find(p => p.id === item.productId);
      if (!product) {
        res.status(400).json({ error: `Produto não encontrado: ${item.productId}` });
        return;
      }
      if (!product.inStock) {
        res.status(400).json({ error: `Produto esgotado: ${item.productId}` });
        return;
      }
      amountTotalCents += product.price * item.quantity;
      cartItems.push({ productId: item.productId, quantity: item.quantity });
    }

    const addBump = addOrderBump === true;
    if (addBump) amountTotalCents += ORDER_BUMP_PRODUCT.price;

    const amountEur = amountTotalCents / 100;
    const fullName = [
      typeof firstName === 'string' ? firstName.trim() : '',
      typeof lastName === 'string' ? lastName.trim() : '',
    ].filter(Boolean).join(' ') || email;

    const trackingCode = generateTrackingCode();

    const firstProduct = PRODUCTS.find(p => p.id === cartItems[0]?.productId);
    const paymentDescription = firstProduct?.translations?.['pt-BR']?.name || 'Panini FIFA World Cup 2026';

    const transaction = await createWayMBTransaction({
      amount: amountEur,
      method: method as 'multibanco' | 'mbway',
      payerEmail: email,
      payerName: fullName,
      payerDocument: typeof nif === 'string' && nif.trim() ? nif.trim() : undefined,
      payerPhone: typeof phone === 'string' && phone.trim() ? phone.trim() : undefined,
      paymentDescription,
    });

    const transactionId = transaction.transactionID || transaction.id;

    // Guardar no banco para o webhook conseguir recuperar os dados do cliente
    try {
      await db.insert(paymentsTable).values({
        id: transactionId,
        amount: amountTotalCents,
        amountReceived: null,
        currency: 'eur',
        status: 'pending',
        livemode: true,
        createdAt: new Date(),
        customerId: null,
        customerEmail: email,
        customerName: fullName,
        receiptEmail: null,
        cartItems,
        orderBump: addBump ? ORDER_BUMP_ID : null,
        orderBump2: null,
        utmSource: typeof utmSource === 'string' ? utmSource.slice(0, 500) : null,
        utmMedium: typeof utmMedium === 'string' ? utmMedium.slice(0, 500) : null,
        utmCampaign: typeof utmCampaign === 'string' ? utmCampaign.slice(0, 500) : null,
        utmContent: typeof utmContent === 'string' ? utmContent.slice(0, 500) : null,
        utmTerm: typeof utmTerm === 'string' ? utmTerm.slice(0, 500) : null,
        locale: typeof locale === 'string' ? locale : 'pt',
        lastPaymentError: null,
        shipping: null,
        paymentMethod: method,
        trackingCode,
        syncedAt: new Date(),
      }).onConflictDoNothing();
    } catch (dbErr) {
      console.warn('[waymb/checkout] DB insert falhou (não fatal):', dbErr);
    }

    // UTMify waiting_payment (fire-and-forget)
    void fireUTMifyWaiting(transactionId, amountTotalCents, email, fullName, cartItems, {
      source: utmSource, medium: utmMedium, campaign: utmCampaign, content: utmContent, term: utmTerm,
    });

    console.log(`[waymb/checkout] transactionId=${transactionId} method=${method} amount=€${amountEur} email=${email}`);

    res.json({
      transactionID: transactionId,
      amount: amountEur,
      method: transaction.method || method,
      referenceData: transaction.referenceData || null,
      trackingCode,
    });
  } catch (error: any) {
    console.error('[waymb/checkout] erro:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar transação' });
  }
});

// POST /api/waymb/transaction-info — polling pelo frontend ("Já efectuei o pagamento")
router.post('/waymb/transaction-info', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.body;
    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'id é obrigatório' });
      return;
    }
    const info = await getWayMBTransactionInfo(id);
    res.json(info);
  } catch (error: any) {
    console.error('[waymb/transaction-info] erro:', error);
    res.status(500).json({ error: error.message || 'Erro ao consultar transação' });
  }
});

// POST /api/waymb/webhook — notificações de estado WayMB (sempre retorna 200)
router.post('/waymb/webhook', async (req: Request, res: Response): Promise<void> => {
  // Responde SEMPRE 200 imediatamente (WayMB exige isso)
  res.status(200).json({ received: true });

  // Processamento assíncrono após resposta
  setImmediate(async () => {
    try {
      const body = req.body as {
        transactionId?: string;
        id?: string;
        amount?: number;
        currency?: string;
        status?: string;
        payer?: { email?: string; name?: string; document?: string };
      };

      const transactionId = body.transactionId || body.id;
      const status = body.status;

      console.log(`[waymb/webhook] transactionId=${transactionId} status=${status}`);

      if (!transactionId) return;

      // Actualizar estado no banco
      if (status === 'COMPLETED' || status === 'DECLINED' || status === 'PENDING') {
        try {
          const dbStatus = status === 'COMPLETED' ? 'succeeded' : status.toLowerCase();
          await db.execute(sql`
            UPDATE payments SET status = ${dbStatus}, synced_at = NOW()
            ${status === 'COMPLETED' ? sql`, amount_received = amount` : sql``}
            WHERE id = ${transactionId}
          `);
        } catch (dbErr) {
          console.warn('[waymb/webhook] DB update falhou:', dbErr);
        }
      }

      if (status !== 'COMPLETED') return;

      // Recuperar dados do cliente do banco
      let paymentRecord: any = null;
      try {
        const rows = await db.execute(sql`SELECT * FROM payments WHERE id = ${transactionId} LIMIT 1`);
        paymentRecord = rows.rows?.[0] ?? null;
      } catch (dbErr) {
        console.warn('[waymb/webhook] DB lookup falhou:', dbErr);
      }

      const customerEmail = paymentRecord?.customer_email || body.payer?.email || '';
      const customerName = paymentRecord?.customer_name || body.payer?.name || '';
      const locale = resolveLocale(paymentRecord?.locale || 'pt');
      const cartItemsRaw = paymentRecord?.cart_items;
      const cartItems: { productId: string; quantity: number }[] = Array.isArray(cartItemsRaw) ? cartItemsRaw : [];
      const amountEurCents: number = paymentRecord?.amount || Math.round((body.amount || 0) * 100);
      const trackingCode: string | undefined = paymentRecord?.tracking_code || undefined;
      const orderBumpId: string = paymentRecord?.order_bump || '';

      console.log(`[waymb/webhook] COMPLETED — email=${customerEmail} nome=${customerName} valor=€${(amountEurCents / 100).toFixed(2)} carrinho=${JSON.stringify(cartItems)} trackingCode=${trackingCode}`);

      // Enviar email de confirmação
      if (customerEmail) {
        const resolvedItems = cartItems.map(ci => {
          const product = PRODUCTS.find(p => p.id === ci.productId);
          if (!product) return null;
          const localeKey = locale as keyof typeof product.translations;
          const name = product.translations[localeKey]?.name || product.translations['pt-BR'].name;
          return { name, quantity: ci.quantity, price: product.price / 100 };
        }).filter((i): i is { name: string; quantity: number; price: number } => i !== null);

        if (orderBumpId === ORDER_BUMP_ID) {
          const localeKey = locale as keyof typeof ORDER_BUMP_PRODUCT.translations;
          resolvedItems.push({
            name: ORDER_BUMP_PRODUCT.translations[localeKey]?.name || ORDER_BUMP_PRODUCT.translations['pt-BR'].name,
            quantity: 1,
            price: ORDER_BUMP_PRODUCT.price / 100,
          });
        }

        const order: OrderInfo = {
          customerEmail,
          customerName: customerName || undefined,
          orderId: transactionId,
          trackingCode,
          items: resolvedItems,
          totalAmount: amountEurCents / 100,
          currency: 'eur',
          locale,
        };

        try { await sendOrderConfirmation(order); } catch (e) { console.error('[waymb/webhook] erro email confirmação:', e); }
        try { await scheduleLogisticsSequence(order); } catch (e) { console.error('[waymb/webhook] erro agendamento email:', e); }
      }

      // UTMify paid (fire-and-forget)
      void fireUTMifyPaid(transactionId, amountEurCents, customerEmail, customerName, cartItems, orderBumpId, paymentRecord);

      // Facebook CAPI Purchase (fire-and-forget)
      void fireCAPI(customerEmail, customerName, amountEurCents, transactionId);

    } catch (err) {
      console.error('[waymb/webhook] erro de processamento:', err);
    }
  });
});

// ── UTMify: waiting_payment ─────────────────────────────────────────────────

async function fireUTMifyWaiting(
  transactionId: string,
  amountEurCents: number,
  customerEmail: string,
  customerName: string,
  cartItems: { productId: string; quantity: number }[],
  utms: { source?: string; medium?: string; campaign?: string; content?: string; term?: string },
): Promise<void> {
  const apiToken = process.env.VITE_UTMIFY_TOKEN;
  if (!apiToken) return;
  try {
    const brlCents = await eurToBrl(amountEurCents);
    const totalEurCents = cartItems.reduce((s, ci) => {
      return s + (PRODUCTS.find(p => p.id === ci.productId)?.price ?? 0) * ci.quantity;
    }, 0) || amountEurCents;
    const toBrl = (eur: number) => Math.round(brlCents * eur / totalEurCents);

    const products = cartItems.map(ci => {
      const p = PRODUCTS.find(pr => pr.id === ci.productId);
      const name = p?.translations?.['pt-BR']?.name || ci.productId;
      return { id: ci.productId, planId: ci.productId, planName: name, name, quantity: ci.quantity, priceInCents: toBrl((p?.price ?? 0) * ci.quantity) };
    });
    if (products.length === 0) {
      products.push({ id: 'panini-wc2026', planId: 'panini-wc2026', planName: 'Panini FIFA World Cup 2026', name: 'Panini FIFA World Cup 2026', quantity: 1, priceInCents: brlCents });
    }

    await fetch(UTMIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-token': apiToken },
      body: JSON.stringify({
        orderId: transactionId, platform: 'other', paymentMethod: 'boleto',
        status: 'waiting_payment', currency: 'BRL',
        createdAt: new Date().toISOString(), approvedDate: new Date().toISOString(),
        customer: { name: customerName || customerEmail, email: customerEmail, phone: null, document: null },
        trackingParameters: { utm_source: utms.source || null, utm_medium: utms.medium || null, utm_campaign: utms.campaign || null, utm_content: utms.content || null, utm_term: utms.term || null },
        commission: { totalPriceInCents: brlCents, gatewayFeeInCents: 0, userCommissionInCents: brlCents },
        products,
      }),
    });
    console.log(`[waymb] UTMify waiting_payment enviado para ${transactionId}`);
  } catch (err: any) {
    console.warn('[waymb] UTMify waiting erro:', err?.message);
  }
}

// ── UTMify: paid ────────────────────────────────────────────────────────────

async function fireUTMifyPaid(
  transactionId: string,
  amountEurCents: number,
  customerEmail: string,
  customerName: string,
  cartItems: { productId: string; quantity: number }[],
  orderBumpId: string,
  paymentRecord: any,
): Promise<void> {
  const apiToken = process.env.VITE_UTMIFY_TOKEN;
  if (!apiToken) return;
  try {
    const brlCents = await eurToBrl(amountEurCents);
    const totalEurBase = cartItems.reduce((s, ci) => {
      return s + (PRODUCTS.find(p => p.id === ci.productId)?.price ?? 0) * ci.quantity;
    }, 0) + (orderBumpId === ORDER_BUMP_ID ? ORDER_BUMP_PRODUCT.price : 0) || amountEurCents;
    const toBrl = (eur: number) => totalEurBase > 0 ? Math.round(brlCents * eur / totalEurBase) : eur;

    const products = cartItems.map(ci => {
      const p = PRODUCTS.find(pr => pr.id === ci.productId);
      const name = p?.translations?.['pt-BR']?.name || ci.productId;
      return { id: ci.productId, planId: ci.productId, planName: name, name, quantity: ci.quantity, priceInCents: toBrl((p?.price ?? 0) * ci.quantity) };
    });
    if (orderBumpId === ORDER_BUMP_ID) {
      products.push({ id: ORDER_BUMP_PRODUCT.id, planId: ORDER_BUMP_PRODUCT.id, planName: ORDER_BUMP_PRODUCT.translations['pt-BR'].name, name: ORDER_BUMP_PRODUCT.translations['pt-BR'].name, quantity: 1, priceInCents: toBrl(ORDER_BUMP_PRODUCT.price) });
    }
    if (products.length === 0) {
      products.push({ id: 'panini-wc2026', planId: 'panini-wc2026', planName: 'Panini FIFA World Cup 2026', name: 'Panini FIFA World Cup 2026', quantity: 1, priceInCents: brlCents });
    }

    await fetch(UTMIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-token': apiToken },
      body: JSON.stringify({
        orderId: transactionId, platform: 'other', paymentMethod: 'boleto',
        status: 'paid', currency: 'BRL',
        createdAt: new Date().toISOString(), approvedDate: new Date().toISOString(),
        customer: { name: customerName || customerEmail, email: customerEmail, phone: null, document: null },
        trackingParameters: {
          utm_source: paymentRecord?.utm_source || null, utm_medium: paymentRecord?.utm_medium || null,
          utm_campaign: paymentRecord?.utm_campaign || null, utm_content: paymentRecord?.utm_content || null,
          utm_term: paymentRecord?.utm_term || null,
        },
        commission: { totalPriceInCents: brlCents, gatewayFeeInCents: 0, userCommissionInCents: brlCents },
        products,
      }),
    });
    console.log(`[waymb/webhook] UTMify paid enviado para ${transactionId}`);
  } catch (err: any) {
    console.warn('[waymb] UTMify paid erro:', err?.message);
  }
}

// ── Facebook CAPI: Purchase ─────────────────────────────────────────────────

async function fireCAPI(email: string, name: string, amountEurCents: number, transactionId: string): Promise<void> {
  const accessToken = process.env.FB_CAPI_ACCESS_TOKEN;
  const pixelId = process.env.FB_PIXEL_ID;
  if (!accessToken || !pixelId) return;
  try {
    const userData: Record<string, string[]> = {};
    if (email) userData.em = [sha256(email)];
    const firstName = name.split(' ')[0];
    if (firstName) userData.fn = [sha256(firstName)];
    const lastName = name.split(' ').slice(1).join(' ');
    if (lastName) userData.ln = [sha256(lastName)];

    await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_id: `purchase_${transactionId}`,
          user_data: userData,
          custom_data: { value: amountEurCents / 100, currency: 'EUR', content_type: 'product' },
        }],
      }),
    });
    console.log(`[waymb/webhook] CAPI Purchase enviado para ${transactionId}`);
  } catch (err) {
    console.error('[waymb] CAPI erro:', err);
  }
}

export default router;
