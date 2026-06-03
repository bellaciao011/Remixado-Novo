import { Router, Request, Response } from 'express';
import { getUncachableStripeClient, getStripePublishableKey } from '../stripeClient';
import { PRODUCTS } from '../productData';

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
          currency: 'eur',
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
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Items are required' });
      return;
    }

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

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountTotal,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amountTotal: amountTotal / 100,
      currency: 'eur',
    });
  } catch (error: any) {
    console.error('PaymentIntent error:', error);
    res.status(400).json({ error: error.message || 'Failed to create payment intent' });
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

    res.json({
      status: isSucceeded ? 'complete' : paymentIntent.status,
      customerEmail: paymentIntent.receipt_email || null,
      amountTotal: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      items: [],
      shipping: paymentIntent.shipping || null,
      paymentMethod: cardBrand ? { brand: cardBrand, last4: cardLast4 } : null,
    });
  } catch (error: any) {
    console.error('Verify payment intent error:', error);
    res.status(404).json({ error: error.message || 'Payment intent not found' });
  }
});

export default router;
