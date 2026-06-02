import { Router } from 'express';
import { getUncachableStripeClient, getStripePublishableKey } from '../stripeClient';
import { PRODUCTS } from '../productData';

const router = Router();

router.get('/checkout/config', async (_req, res) => {
  try {
    const publishableKey = await getStripePublishableKey();
    res.json({ publishableKey });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get Stripe config' });
  }
});

router.post('/checkout/session', async (req, res) => {
  try {
    const { items, successUrl, cancelUrl, locale } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    const stripe = await getUncachableStripeClient();

    const lineItems = [];
    for (const item of items as { productId: string; quantity: number; name?: string }[]) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: 'Each item requires productId and quantity >= 1' });
      }

      const product = PRODUCTS.find(p => p.id === item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.productId}` });
      }

      if (!product.inStock) {
        return res.status(400).json({ error: `Product out of stock: ${item.productId}` });
      }

      const productName = item.name || product.stripeProductName;
      const imageUrl = product.images[0]
        ? `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}${product.images[0]}`
        : undefined;

      lineItems.push({
        price_data: {
          currency: 'brl',
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

router.get('/checkout/verify', async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({ error: 'session_id is required' });
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

export default router;
