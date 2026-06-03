---
name: Stripe setup quirks
description: What to avoid with Stripe integration — stripe-replit-sync blocks publishing; use SDK directly
---

## stripe-replit-sync blocks publishing — DO NOT use it

The `stripe-replit-sync` package triggers a "Finish Stripe sandbox setup" blocker in the Replit publish flow that cannot be bypassed. It was removed from both `artifacts/api-server/package.json` and the root `package.json`.

**Why:** Replit detects the package and registers a Stripe sandbox connection (`environment: development`). The publishing UI then requires sandbox "claim" before allowing publish — even when manual STRIPE_SECRET_KEY/STRIPE_PUBLISHABLE_KEY secrets are set.

**How to apply:** Never re-add `stripe-replit-sync`. Use the Stripe SDK directly instead.

## Webhook setup (replacement for StripeSync.findOrCreateManagedWebhook)

`index.ts` at startup: lists `stripe.webhookEndpoints` and creates one if the URL doesn't exist yet. Webhook secret stored in memory via `setWebhookSecret()` and also read from `STRIPE_WEBHOOK_SECRET` env var if set.

`webhookHandlers.ts`: uses `stripe.webhooks.constructEvent(payload, sig, secret)` directly. If no secret is available, handler skips verification (safe for dev; add secret for prod).

## Stripe keys

Code reads `process.env.STRIPE_SECRET_KEY` and `process.env.STRIPE_PUBLISHABLE_KEY` — global Replit secrets, available in dev and production.
