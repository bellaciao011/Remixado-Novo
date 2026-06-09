import app from "./app";
import { logger } from "./lib/logger";
import { getUncachableStripeClient, setWebhookSecret } from "./stripeClient";
import { ensureScheduledEmailsTable, startEmailWorker } from "./email/emailScheduler";

// Catch uncaught errors and log them clearly before exiting
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled rejection:', reason);
  process.exit(1);
});

async function initStripe() {
  try {
    // If STRIPE_WEBHOOK_SECRET is manually set (recommended for production), trust it
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      setWebhookSecret(process.env.STRIPE_WEBHOOK_SECRET);
      logger.info('Stripe webhook secret loaded from STRIPE_WEBHOOK_SECRET env var');
      return;
    }

    const stripe = await getUncachableStripeClient();
    const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
    const webhookUrl = `${webhookBaseUrl}/api/stripe/webhook`;

    const existing = await stripe.webhookEndpoints.list({ limit: 100 });
    const found = existing.data.find(w => w.url === webhookUrl);
    if (found) {
      await stripe.webhookEndpoints.del(found.id);
      logger.info('Deleted existing Stripe webhook to obtain fresh signing secret');
    }

    const created = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: ['*'],
    });
    setWebhookSecret(created.secret!);
    logger.info('Stripe webhook created and signing secret stored in memory');
  } catch (error: any) {
    logger.warn({ err: error }, 'Failed to initialize Stripe webhook — continuing without it');
  }
}

async function initDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      logger.warn('DATABASE_URL not set — database features (order tracking, email scheduler) will be disabled');
      return;
    }
    await ensureScheduledEmailsTable();
    startEmailWorker(60_000);
    logger.info('Database initialized and email worker started');
  } catch (error: any) {
    logger.warn({ err: error }, 'Database initialization failed — continuing without database features. Check DATABASE_URL.');
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  console.error('[FATAL] PORT environment variable is required but was not provided.');
  process.exit(1);
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  console.error(`[FATAL] Invalid PORT value: "${rawPort}"`);
  process.exit(1);
}

await initDatabase();
await initStripe();

app.listen(port, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});
