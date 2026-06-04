import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes";
import { WebhookHandlers } from "./webhookHandlers";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const handleStripeWebhook = async (req: any, res: any) => {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe-signature' });
  }

  try {
    const sig = Array.isArray(signature) ? signature[0] : signature;

    if (!Buffer.isBuffer(req.body)) {
      console.error('STRIPE WEBHOOK ERROR: req.body is not a Buffer');
      return res.status(500).json({ error: 'Webhook processing error' });
    }

    await WebhookHandlers.processWebhook(req.body as Buffer, sig);
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    res.status(400).json({ error: 'Webhook processing error' });
  }
};

app.post('/api/checkout/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
// Catch-all for Stripe webhook URLs with UUID suffix (old/integration webhooks) — return 200 to stop retries
app.post('/api/stripe/webhook/:id', (_req: any, res: any) => res.status(200).json({ received: true }));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve product images from attached_assets at /assets
// 30-day cache for product images (no content-hash in filenames, so we avoid immutable)
app.use('/assets', express.static(path.resolve(import.meta.dirname, '..', '..', '..', 'attached_assets'), {
  maxAge: '30d',
  setHeaders(res) {
    res.setHeader('Cache-Control', 'public, max-age=2592000');
  },
}));

app.use("/api", router);

export default app;
