import { runMigrations } from 'stripe-replit-sync';
import { getStripeSync } from "./stripeClient";
import app from "./app";
import { logger } from "./lib/logger";

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    logger.warn('DATABASE_URL not set — skipping Stripe initialization');
    return;
  }

  try {
    logger.info('Initializing Stripe schema...');
    await runMigrations({ databaseUrl });
    logger.info('Stripe schema ready');

    const stripeSync = await getStripeSync();

    const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
    await stripeSync.findOrCreateManagedWebhook(`${webhookBaseUrl}/api/stripe/webhook`, {
      enabled_events: ['*'],
    });
    logger.info('Stripe webhook configured');

    stripeSync.syncBackfill()
      .then(() => logger.info('Stripe data synced'))
      .catch((err: Error) => logger.error({ err }, 'Error syncing Stripe data'));
  } catch (error: any) {
    logger.warn({ err: error }, 'Failed to initialize Stripe — continuing without Stripe');
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

await initStripe();

app.listen(port, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});
