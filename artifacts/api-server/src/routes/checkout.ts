import { Router } from 'express';
import { getUncachableStripeClient } from '../stripeClient';

const router = Router();

router.post('/checkout/session', async (req, res) => {
  try {
    const { items, successUrl, cancelUrl, locale } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    const stripe = await getUncachableStripeClient();

    const lineItems = items.map((item: { name: string; price: number; quantity: number; image: string; priceId?: string }) => ({
      price_data: {
        currency: 'brl',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

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

    res.json({
      status: session.payment_status,
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
