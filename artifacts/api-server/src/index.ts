import app from "./app";
import { logger } from "./lib/logger";
import { getUncachableStripeClient, setWebhookSecret } from "./stripeClient";

async function initStripe() {
  try {
    const stripe = await getUncachableStripeClient();
    const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
    const webhookUrl = `${webhookBaseUrl}/api/stripe/webhook`;

    const existing = await stripe.webhookEndpoints.list({ limit: 20 });
    const found = existing.data.find(w => w.url === webhookUrl && w.status === 'enabled');

    if (!found) {
      const created = await stripe.webhookEndpoints.create({
        url: webhookUrl,
        enabled_events: ['*'],
      });
      setWebhookSecret(created.secret!);
      logger.info('Stripe webhook created');
    } else {
      logger.info('Stripe webhook already exists');
    }
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

await initStripe();

app.listen(port, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});
