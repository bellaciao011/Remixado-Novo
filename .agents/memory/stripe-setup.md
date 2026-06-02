---
name: Stripe setup quirks
description: Common issues when initializing stripe-replit-sync in the API server
---

# Stripe Setup Quirks

## Rule
Always run `runMigrations({ databaseUrl })` (no `schema` param) before calling `getStripeSync()`. Call `findOrCreateManagedWebhook` with `enabled_events: ['*']`. If the stripe schema exists but has no tables, run migrations manually with a node script.

**Why:** The `schema` param causes migrations to target the wrong table namespace. `findOrCreateManagedWebhook` calls `stripe.webhookEndpoints.create` and Stripe's API requires `enabled_events`. If the server restarts before migrations complete, the DB schema is left empty.

**How to apply:**
- In `artifacts/api-server/src/index.ts`, use `await runMigrations({ databaseUrl })` 
- Pass `{ enabled_events: ['*'] }` as second arg to `findOrCreateManagedWebhook`
- If stripe schema tables are missing, run: `node --input-type=module -e "import {runMigrations} from '...'; await runMigrations({databaseUrl: process.env.DATABASE_URL})"`
