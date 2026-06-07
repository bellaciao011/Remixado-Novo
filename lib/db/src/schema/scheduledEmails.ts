import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const scheduledEmailsTable = pgTable("scheduled_emails", {
  id: serial("id").primaryKey(),
  paymentIntentId: text("payment_intent_id").notNull(),
  step: integer("step").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  subject: text("subject").notNull(),
  html: text("html").notNull(),
  sendAt: timestamp("send_at", { withTimezone: true }).notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  errorMsg: text("error_msg"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_scheduled_emails_due")
    .on(table.sendAt)
    .where(sql`${table.sentAt} IS NULL`),
]);

export type ScheduledEmail = typeof scheduledEmailsTable.$inferSelect;
export type InsertScheduledEmail = typeof scheduledEmailsTable.$inferInsert;
