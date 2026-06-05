import { pgTable, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const paymentsTable = pgTable("payments", {
  id: text("id").primaryKey(),
  amount: integer("amount").notNull(),
  amountReceived: integer("amount_received"),
  currency: text("currency").notNull().default("eur"),
  status: text("status").notNull(),
  livemode: boolean("livemode").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  customerId: text("customer_id"),
  customerEmail: text("customer_email"),
  customerName: text("customer_name"),
  receiptEmail: text("receipt_email"),
  cartItems: jsonb("cart_items"),
  orderBump: text("order_bump"),
  orderBump2: text("order_bump_2"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmContent: text("utm_content"),
  utmTerm: text("utm_term"),
  locale: text("locale"),
  lastPaymentError: text("last_payment_error"),
  shipping: jsonb("shipping"),
  paymentMethod: text("payment_method"),
  syncedAt: timestamp("synced_at", { withTimezone: true }).defaultNow(),
});

export type Payment = typeof paymentsTable.$inferSelect;
export type InsertPayment = typeof paymentsTable.$inferInsert;
