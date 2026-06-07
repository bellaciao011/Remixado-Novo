import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const processedWebhookEventsTable = pgTable("processed_webhook_events", {
  eventId: text("event_id").primaryKey(),
  processedAt: timestamp("processed_at", { withTimezone: true }).defaultNow(),
});

export type ProcessedWebhookEvent = typeof processedWebhookEventsTable.$inferSelect;
