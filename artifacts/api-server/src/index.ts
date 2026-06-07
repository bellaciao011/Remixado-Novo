import app from "./app";
import { logger } from "./lib/logger";
import { getUncachableStripeClient, setWebhookSecret } from "./stripeClient";
import { ensureScheduledEmailsTable, startEmailWorker } from "./email/emailScheduler";

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

    // Delete existing webhook at this URL so we can recreate and obtain a fresh secret.
    // Stripe only returns the signing secret at creation time, so we must recreate on every
    // cold start when STRIPE_WEBHOOK_SECRET is not persisted in env.
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
    logger.info(
      'TIP: Set STRIPE_WEBHOOK_SECRET in Replit Secrets to avoid recreating webhook on each restart'
    );
  } catch (error: any) {
    logger.warn({ err: error }, 'Failed to initialize Stripe webhook — continuing without it');
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

// Create scheduled_emails table if it doesn't exist, then start email worker
await ensureScheduledEmailsTable();
startEmailWorker(60_000);

await initStripe();

app.listen(port, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});
