import { Router, Request, Response } from 'express';
import { getUncachableStripeClient, getStripePublishableKey } from '../stripeClient';
import { PRODUCTS, ORDER_BUMP_PRICE, ORDER_BUMP_ID } from '../productData';
import { sendUpsellConfirmation } from '../email/emailService';
import type { OrderInfo } from '../email/templates';

const UTMIFY_API_URL = 'https://api.utmify.com.br/api-credentials/orders';

function generateTrackingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'PAN';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function fireUTMifyWaitingPayment(
  piId: string,
  amountUsdCents: number,
  customerEmail: string,
  customerName: string,
  cartItems: { productId: string; quantity: number }[],
  utms: { source?: string; medium?: string; campaign?: string; content?: string; term?: string },
): Promise<void> {
  const apiToken = process.env.VITE_UTMIFY_TOKEN;
  if (!apiToken) return;

  try {
    // Fetch spot USD/BRL rate for UTMify (which requires BRL values)
    let totalBrlCents = amountUsdCents;
    try {
      const rateRes = await fetch('https://open.er-api.com/v6/latest/USD');
      if (rateRes.ok) {
        const rateData = await rateRes.json() as { rates?: { BRL?: number } };
        const rate = rateData?.rates?.BRL;
        if (rate && rate > 0) totalBrlCents = Math.round(amountUsdCents * rate);
      }
    } catch { /* rate fetch optional — proceed with USD amount */ }

    const totalUsdCents = cartItems.reduce((sum, ci) => {
      const p = PRODUCTS.find(pr => pr.id === ci.productId);
      return sum + (p?.price ?? 0) * ci.quantity;
    }, 0) || amountUsdCents;

    const toBrl = (usd: number) => Math.round(totalBrlCents * usd / totalUsdCents);

    const products = cartItems.map(ci => {
      const p = PRODUCTS.find(pr => pr.id === ci.productId);
      const name = p?.translations?.['pt-BR']?.name || ci.productId;
      const usd = (p?.price ?? 0) * ci.quantity;
      return { id: ci.productId, planId: ci.productId, planName: name, name, quantity: ci.quantity, priceInCents: toBrl(usd) };
    });
    if (products.length === 0) {
      products.push({ id: 'panini-wc2026', planId: 'panini-wc2026', planName: 'Panini FIFA World Cup 2026', name: 'Panini FIFA World Cup 2026', quantity: 1, priceInCents: totalBrlCents });
    }

    const now = new Date().toISOString();
    const payload = {
      orderId: piId,
      platform: 'other',
      paymentMethod: 'credit_card',
      status: 'waiting_payment',
      currency: 'BRL',
      createdAt: now,
      approvedDate: now,
      customer: { name: customerName || customerEmail, email: customerEmail, phone: null, document: null },
      trackingParameters: {
        utm_source: utms.source || null,
        utm_medium: utms.medium || null,
        utm_campaign: utms.campaign || null,
        utm_content: utms.content || null,
        utm_term: utms.term || null,
      },
      commission: { totalPriceInCents: totalBrlCents, gatewayFeeInCents: 0, userCommissionInCents: totalBrlCents },
      products,
    };

    const res = await fetch(UTMIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-token': apiToken },
      body: JSON.stringify(payload),
    });
    const result = await res.json() as any;
    console.log(`[checkout] UTMify waiting_payment for PI ${piId}:`, result?.OK ? 'OK' : JSON.stringify(result));
  } catch (err: any) {
    console.warn('[checkout] UTMify waiting_payment error:', err?.message);
  }
}

const router = Router();

router.get('/checkout/config', async (_req: Request, res: Response): Promise<void> => {
  try {
    const publishableKey = await getStripePublishableKey();
    res.json({ publishableKey });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get Stripe config' });
  }
});

router.post('/checkout/session', async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, successUrl, cancelUrl, locale } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Items are required' });
      return;
    }

    const stripe = await getUncachableStripeClient();
    const lineItems = [];

    for (const item of items as { productId: string; quantity: number; name?: string }[]) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        res.status(400).json({ error: 'Each item requires productId and quantity >= 1' });
        return;
      }

      const product = PRODUCTS.find(p => p.id === item.productId);
      if (!product) {
        res.status(400).json({ error: `Product not found: ${item.productId}` });
        return;
      }

      if (!product.inStock) {
        res.status(400).json({ error: `Product out of stock: ${item.productId}` });
        return;
      }

      const productName = item.name || product.stripeProductName;
      const imageUrl = product.images[0]
        ? `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}${product.images[0]}`
        : undefined;

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: productName,
            ...(imageUrl ? { images: [imageUrl] } : {}),
          },
          unit_amount: product.price,
        },
        quantity: item.quantity,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      locale: locale === 'pt-BR' ? 'pt-BR' : locale === 'es' ? 'es' : locale === 'de' ? 'de' : 'en',
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['BR', 'US', 'DE', 'ES', 'PT', 'AR', 'MX', 'CO'],
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Checkout session error:', error);
    res.status(400).json({ error: error.message || 'Failed to create checkout session' });
  }
});

router.post('/checkout/payment-intent', async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, email, firstName, lastName } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Items are required' });
      return;
    }

    // Build masked email for Stripe: concatenate name parts, keep only a-z0-9, append @email.com
    // Real email stays in metadata.customer_real_email for internal email sequences.
    const toStripeEmail = (first: string, last: string, fallback: string): string => {
      const slug = `${first}${last}`.toLowerCase().replace(/[^a-z0-9]/g, '');
      return slug.length >= 2 ? `${slug}@email.com` : fallback;
    };
    const realEmail: string = typeof email === 'string' ? email.trim() : '';
    const stripeEmail: string = toStripeEmail(
      typeof firstName === 'string' ? firstName : '',
      typeof lastName  === 'string' ? lastName  : '',
      realEmail
    );

    const stripe = await getUncachableStripeClient();
    let amountTotal = 0;

    for (const item of items as { productId: string; quantity: number }[]) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        res.status(400).json({ error: 'Each item requires productId and quantity >= 1' });
        return;
      }

      const product = PRODUCTS.find(p => p.id === item.productId);
      if (!product) {
        res.status(400).json({ error: `Product not found: ${item.productId}` });
        return;
      }

      if (!product.inStock) {
        res.status(400).json({ error: `Product out of stock: ${item.productId}` });
        return;
      }

      amountTotal += product.price * item.quantity;
    }

    const { locale, utmSource, utmMedium, utmCampaign, utmContent, utmTerm } = req.body;
    const cartItems = (items as { productId: string; quantity: number }[]).map(i => ({
      productId: i.productId,
      quantity: i.quantity,
    }));

    const customerName = [
      typeof firstName === 'string' ? firstName.trim() : '',
      typeof lastName  === 'string' ? lastName.trim()  : '',
    ].filter(Boolean).join(' ');

    const trackingCode = generateTrackingCode();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountTotal,
      currency: 'usd',
      payment_method_types: ['card'],
      // No customer object and no receipt_email — Stripe must NOT send automatic receipts.
      // Real email is stored in metadata only; our Resend flow handles all transactional emails.
      description: 'Panini FIFA World Cup 2026',
      metadata: {
        cart_items: JSON.stringify(cartItems),
        locale: typeof locale === 'string' ? locale : 'en',
        // Real customer data — used by webhook for transactional email sequences
        customer_email: realEmail,
        customer_name: customerName,
        // Friendly tracking code shown to the customer (PAN + 6 chars)
        tracking_code: trackingCode,
        // UTM parameters captured by UTMify's utms.js in the browser
        utm_source: typeof utmSource === 'string' ? utmSource.slice(0, 500) : '',
        utm_medium: typeof utmMedium === 'string' ? utmMedium.slice(0, 500) : '',
        utm_campaign: typeof utmCampaign === 'string' ? utmCampaign.slice(0, 500) : '',
        utm_content: typeof utmContent === 'string' ? utmContent.slice(0, 500) : '',
        utm_term: typeof utmTerm === 'string' ? utmTerm.slice(0, 500) : '',
      },
    });

    // Fire-and-forget: register lead with UTMify as waiting_payment (does not block checkout response)
    void fireUTMifyWaitingPayment(
      paymentIntent.id,
      amountTotal,
      realEmail,
      customerName,
      cartItems,
      {
        source:   typeof utmSource   === 'string' ? utmSource   : undefined,
        medium:   typeof utmMedium   === 'string' ? utmMedium   : undefined,
        campaign: typeof utmCampaign === 'string' ? utmCampaign : undefined,
        content:  typeof utmContent  === 'string' ? utmContent  : undefined,
        term:     typeof utmTerm     === 'string' ? utmTerm     : undefined,
      },
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      trackingCode,
      amountTotal: amountTotal / 100,
      currency: 'usd',
      stripeCustomerId: null,
    });
  } catch (error: any) {
    console.error('PaymentIntent error:', error);
    res.status(400).json({ error: error.message || 'Failed to create payment intent' });
  }
});

router.put('/checkout/payment-intent/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { addOrderBump1 } = req.body as { addOrderBump1?: boolean };

    const stripe = await getUncachableStripeClient();

    // Retrieve authoritative cart from PI metadata — never trust client-supplied items
    const pi = await stripe.paymentIntents.retrieve(id);
    const cartItems: { productId: string; quantity: number }[] = (() => {
      try {
        return JSON.parse(pi.metadata?.cart_items || '[]');
      } catch { return []; }
    })();

    if (cartItems.length === 0) {
      res.status(400).json({ error: 'Cart metadata not found on PaymentIntent' });
      return;
    }

    let amountTotal = 0;
    for (const item of cartItems) {
      const product = PRODUCTS.find(p => p.id === item.productId);
      if (!product) {
        res.status(400).json({ error: `Product not found: ${item.productId}` });
        return;
      }
      amountTotal += product.price * item.quantity;
    }

    if (addOrderBump1) amountTotal += ORDER_BUMP_PRICE;

    await stripe.paymentIntents.update(id, {
      amount: amountTotal,
      metadata: {
        ...pi.metadata,
        order_bump: addOrderBump1 ? ORDER_BUMP_ID : '',
      },
    });

    res.json({ amountTotal: amountTotal / 100, currency: 'usd' });
  } catch (error: any) {
    console.error('Update PaymentIntent error:', error);
    res.status(400).json({ error: error.message || 'Failed to update payment intent' });
  }
});

router.get('/checkout/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { session_id } = req.query;

    if (!session_id || typeof session_id !== 'string') {
      res.status(400).json({ error: 'session_id is required' });
      return;
    }

    const stripe = await getUncachableStripeClient();
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items'],
    });

    const items = session.line_items?.data.map(item => ({
      name: item.description || '',
      quantity: item.quantity || 1,
      amount: (item.amount_total || 0) / 100,
    })) || [];

    const isPaid = session.payment_status === 'paid';

    res.json({
      status: isPaid ? 'complete' : session.payment_status,
      customerEmail: session.customer_details?.email || null,
      amountTotal: session.amount_total ? session.amount_total / 100 : null,
      currency: session.currency,
      items,
    });
  } catch (error: any) {
    console.error('Verify session error:', error);
    res.status(404).json({ error: error.message || 'Session not found' });
  }
});

router.get('/checkout/verify-payment', async (req: Request, res: Response): Promise<void> => {
  try {
    const { payment_intent_id } = req.query;

    if (!payment_intent_id || typeof payment_intent_id !== 'string') {
      res.status(400).json({ error: 'payment_intent_id is required' });
      return;
    }

    const stripe = await getUncachableStripeClient();
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id, {
      expand: ['payment_method'],
    });

    const isSucceeded = paymentIntent.status === 'succeeded';

    const pm = paymentIntent.payment_method as any;
    const cardBrand = pm?.card?.brand || null;
    const cardLast4 = pm?.card?.last4 || null;
    const paymentMethodId = pm?.id || (typeof paymentIntent.payment_method === 'string' ? paymentIntent.payment_method : null);
    const stripeCustomerId = typeof paymentIntent.customer === 'string'
      ? paymentIntent.customer
      : (paymentIntent.customer as any)?.id || null;

    res.json({
      status: isSucceeded ? 'complete' : paymentIntent.status,
      customerEmail: paymentIntent.receipt_email || null,
      amountTotal: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      items: [],
      shipping: paymentIntent.shipping || null,
      paymentMethod: cardBrand ? { brand: cardBrand, last4: cardLast4 } : null,
      stripeCustomerId: stripeCustomerId || null,
      paymentMethodId: paymentMethodId || null,
    });
  } catch (error: any) {
    console.error('Verify payment intent error:', error);
    res.status(404).json({ error: error.message || 'Payment intent not found' });
  }
});

router.post('/checkout/upsell', async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId, paymentMethodId, productId } = req.body;

    if (!customerId || !paymentMethodId || !productId) {
      res.status(400).json({ error: 'customerId, paymentMethodId, and productId are required' });
      return;
    }

    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) {
      res.status(400).json({ error: `Product not found: ${productId}` });
      return;
    }

    if (!product.inStock) {
      res.status(400).json({ error: `Product out of stock: ${productId}` });
      return;
    }

    const upsellAmount = Math.round(product.price * 0.5);

    const stripe = await getUncachableStripeClient();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: upsellAmount,
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        upsell_product_id: productId,
        upsell_type: 'one_click_upsell',
        cart_items: JSON.stringify([{ productId, quantity: 1 }]),
      },
    });

    if (paymentIntent.status === 'succeeded') {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        const customerEmail = (customer as any).email || '';
        const customerLocale = (customer as any).metadata?.locale || 'pt-BR';
        if (customerEmail) {
          const localeKey = customerLocale as keyof typeof product.translations;
          const upsellProductName = product.translations[localeKey]?.name || product.translations['pt-BR'].name;
          const order: OrderInfo = {
            customerEmail,
            customerName: (customer as any).name || undefined,
            orderId: paymentIntent.id,
            items: [],
            totalAmount: upsellAmount / 100,
            currency: 'usd',
            locale: customerLocale,
          };
          await sendUpsellConfirmation(order, upsellProductName, upsellAmount / 100);
        }
      } catch (emailErr) {
        console.error('[upsell] Failed to send upsell confirmation email:', emailErr);
      }
    }

    res.json({
      status: paymentIntent.status,
      amountCharged: upsellAmount / 100,
      currency: 'usd',
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Upsell error:', error);
    if (error.code === 'authentication_required' || error.code === 'requires_action') {
      res.status(402).json({ error: 'Authentication required for this payment', code: error.code });
      return;
    }
    res.status(400).json({ error: error.message || 'Failed to process upsell payment' });
  }
});

export default router;
