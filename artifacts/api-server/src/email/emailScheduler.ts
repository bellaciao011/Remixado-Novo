import { db } from '@workspace/db';
import { sql } from 'drizzle-orm';
import { getResendClient } from './resendClient';

const FROM_ADDRESS = 'Panini FIFA World Cup 2026 <noreply@confirmedorder.site>';

export async function ensureScheduledEmailsTable(): Promise<void> {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS scheduled_emails (
        id SERIAL PRIMARY KEY,
        payment_intent_id TEXT NOT NULL,
        step INTEGER NOT NULL,
        recipient_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        html TEXT NOT NULL,
        send_at TIMESTAMPTZ NOT NULL,
        sent_at TIMESTAMPTZ,
        error_msg TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_scheduled_emails_due
        ON scheduled_emails(send_at)
        WHERE sent_at IS NULL
    `);
    console.log('[emailScheduler] Table ready');
  } catch (err) {
    console.error('[emailScheduler] Failed to create table:', err);
  }
}

export async function insertScheduledEmail(params: {
  paymentIntentId: string;
  step: number;
  recipientEmail: string;
  subject: string;
  html: string;
  sendAt: Date;
}): Promise<void> {
  await db.execute(sql`
    INSERT INTO scheduled_emails
      (payment_intent_id, step, recipient_email, subject, html, send_at)
    VALUES
      (${params.paymentIntentId}, ${params.step}, ${params.recipientEmail},
       ${params.subject}, ${params.html}, ${params.sendAt.toISOString()})
    ON CONFLICT DO NOTHING
  `);
}

export async function processDueEmails(): Promise<void> {
  let rows: any[];
  try {
    const result = await db.execute(sql`
      SELECT id, recipient_email, subject, html, step, payment_intent_id
      FROM scheduled_emails
      WHERE send_at <= NOW()
        AND sent_at IS NULL
      ORDER BY send_at ASC
      LIMIT 5
    `);
    rows = result.rows ?? [];
  } catch (err) {
    console.error('[emailScheduler] Failed to query due emails:', err);
    return;
  }

  if (rows.length === 0) return;

  const resend = getResendClient();

  for (const row of rows) {
    try {
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: row.recipient_email as string,
        subject: row.subject as string,
        html: row.html as string,
      });
      await db.execute(sql`
        UPDATE scheduled_emails SET sent_at = NOW() WHERE id = ${row.id}
      `);
      console.log(`[emailScheduler] Sent logistics step ${row.step} to ${row.recipient_email}`);
    } catch (err: any) {
      const msg = String(err?.message || err).slice(0, 500);
      await db.execute(sql`
        UPDATE scheduled_emails SET error_msg = ${msg} WHERE id = ${row.id}
      `);
      console.error(`[emailScheduler] Failed step ${row.step} for ${row.recipient_email}:`, err);
    }

    // Small delay between sends to stay within Resend rate limits
    await new Promise(r => setTimeout(r, 300));
  }
}

export function startEmailWorker(intervalMs = 60_000): NodeJS.Timeout {
  console.log(`[emailScheduler] Worker started — checking every ${intervalMs / 1000}s`);
  // Run once immediately on startup to catch any emails missed during downtime
  processDueEmails().catch(err => console.error('[emailScheduler] Initial run error:', err));
  return setInterval(() => {
    processDueEmails().catch(err => console.error('[emailScheduler] Worker error:', err));
  }, intervalMs);
}
