import Stripe from 'stripe';
import { StripeSync } from 'stripe-replit-sync';

function getKeys(): { publishableKey: string; secretKey: string } {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY not configured in Secrets');
  }
  if (!publishableKey) {
    throw new Error('STRIPE_PUBLISHABLE_KEY not configured in Secrets');
  }

  return { secretKey, publishableKey };
}

export async function getUncachableStripeClient(): Promise<Stripe> {
  const { secretKey } = getKeys();
  return new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil' as any,
  });
}

export async function getStripePublishableKey(): Promise<string> {
  const { publishableKey } = getKeys();
  return publishableKey;
}

export async function getStripeSecretKey(): Promise<string> {
  const { secretKey } = getKeys();
  return secretKey;
}

let stripeSync: StripeSync | null = null;

export async function getStripeSync(): Promise<StripeSync> {
  if (!stripeSync) {
    const secretKey = await getStripeSecretKey();
    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL!,
        max: 2,
      },
      stripeSecretKey: secretKey,
    });
  }
  return stripeSync;
}
