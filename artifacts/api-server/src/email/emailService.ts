import { getResendClient } from './resendClient';
import {
  OrderInfo,
  buildOrderConfirmationEmail,
  buildUpsellConfirmationEmail,
  buildLogisticsEmail,
} from './templates';
import { insertScheduledEmail } from './emailScheduler';

const FROM_ADDRESS = 'Panini FIFA World Cup 2026 <noreply@confirmedorder.site>';

// Days after purchase when each logistics email is sent
const LOGISTICS_DAYS = [1, 2, 3, 4, 6, 8, 10, 12, 15, 18, 22, 24, 26, 28];

function getLogoUrl(): string {
  const domain = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:8080';
  const protocol = domain.startsWith('localhost') ? 'http' : 'https';
  return `${protocol}://${domain}/assets/Panini-logo_1780538832749.webp`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function sendOrderConfirmation(order: OrderInfo): Promise<void> {
  try {
    const resend = getResendClient();
    const logoUrl = getLogoUrl();
    const { subject, html } = buildOrderConfirmationEmail(order, logoUrl);
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: order.customerEmail,
      subject,
      html,
    });
    console.log(`[email] Order confirmation sent to ${order.customerEmail} (locale: ${order.locale || 'pt-BR'})`);
  } catch (err) {
    console.error('[email] Failed to send order confirmation:', err);
  }
}

export async function sendUpsellConfirmation(
  order: OrderInfo,
  upsellProductName: string,
  upsellAmount: number
): Promise<void> {
  try {
    const resend = getResendClient();
    const logoUrl = getLogoUrl();
    const { subject, html } = buildUpsellConfirmationEmail(order, upsellProductName, upsellAmount, logoUrl);
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: order.customerEmail,
      subject,
      html,
    });
    console.log(`[email] Upsell confirmation sent to ${order.customerEmail} (locale: ${order.locale || 'pt-BR'})`);
  } catch (err) {
    console.error('[email] Failed to send upsell confirmation:', err);
  }
}

/**
 * Schedules the full logistics email sequence in PostgreSQL.
 *
 * Each email is written to the `scheduled_emails` table with its future
 * `send_at` timestamp.  A background worker in index.ts reads this table
 * every 60 s and calls Resend only when each email is actually due.
 *
 * This replaces Resend's `scheduledAt` parameter (requires paid plan and was
 * sending all emails immediately on the free plan).
 */
export async function scheduleLogisticsSequence(order: OrderInfo): Promise<void> {
  const logoUrl = getLogoUrl();
  const now = new Date();
  let scheduled = 0;

  for (let idx = 0; idx < LOGISTICS_DAYS.length; idx++) {
    const days = LOGISTICS_DAYS[idx];
    const step = idx + 1;
    const sendAt = addDays(now, days);
    const { subject, html } = buildLogisticsEmail(order, step, logoUrl);

    try {
      await insertScheduledEmail({
        paymentIntentId: order.orderId,
        step,
        recipientEmail: order.customerEmail,
        subject,
        html,
        sendAt,
      });
      scheduled++;
    } catch (err) {
      console.error(`[email] Failed to schedule logistics step ${step}:`, err);
    }
  }

  console.log(`[email] ${scheduled}/${LOGISTICS_DAYS.length} logistics emails queued in DB for ${order.customerEmail} (first send: +1 day)`);
}

export async function sendTestEmail(templateNumber: number, toEmail: string, locale?: string): Promise<void> {
  const order: OrderInfo = {
    customerEmail: toEmail,
    customerName: 'Teste',
    orderId: 'TEST-' + Date.now(),
    items: [
      { name: 'Box-Bundle FIFA World Cup 2026™', quantity: 1, price: 36 },
    ],
    totalAmount: 36,
    currency: 'eur',
    shippingAddress: 'Rua Teste, 123 – São Paulo, SP',
    locale: locale || 'pt-BR',
  };

  const resend = getResendClient();
  const logoUrl = getLogoUrl();

  if (templateNumber === 1) {
    const { subject, html } = buildOrderConfirmationEmail(order, logoUrl);
    await resend.emails.send({ from: FROM_ADDRESS, to: toEmail, subject, html });
  } else if (templateNumber === 2) {
    const { subject, html } = buildUpsellConfirmationEmail(order, 'Caixa com 50 Envelopes', 16, logoUrl);
    await resend.emails.send({ from: FROM_ADDRESS, to: toEmail, subject, html });
  } else {
    const step = Math.min(Math.max(templateNumber - 2, 1), 14);
    const { subject, html } = buildLogisticsEmail(order, step, logoUrl);
    await resend.emails.send({ from: FROM_ADDRESS, to: toEmail, subject, html });
  }
}
