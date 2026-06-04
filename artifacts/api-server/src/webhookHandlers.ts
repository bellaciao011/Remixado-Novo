import { getUncachableStripeClient, getWebhookSecret } from './stripeClient';
import { PRODUCTS } from './productData';
import { sendOrderConfirmation, scheduleLogisticsSequence } from './email/emailService';
import type { OrderInfo } from './email/templates';

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
      await WebhookHandlers.handlePaymentIntentSucceeded(pi);
    }
  }

  private static async handlePaymentIntentSucceeded(pi: any): Promise<void> {
    try {
      const customerEmail: string = pi.receipt_email || pi.customer_email || '';
      if (!customerEmail) {
        console.warn('[webhook] payment_intent.succeeded: no customer email found, skipping email sequence');
        return;
      }

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
          return {
            name: product.translations['pt-BR'].name,
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
      };

      await sendOrderConfirmation(order);
      await scheduleLogisticsSequence(order);
    } catch (err) {
      console.error('[webhook] Error handling payment_intent.succeeded:', err);
    }
  }
}
