import { Router, Request, Response } from 'express';
import { createHash } from 'crypto';

const router = Router();
const FB_PIXEL_ID = '1622885129012772';
const FB_API_VERSION = 'v18.0';

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

router.post('/tracking/event', async (req: Request, res: Response): Promise<void> => {
  const accessToken = process.env.FB_CAPI_ACCESS_TOKEN;

  if (!accessToken) {
    res.status(200).json({ ok: false, reason: 'no_token' });
    return;
  }

  const {
    eventName,
    email,
    firstName,
    lastName,
    country,
    value,
    currency,
    contentIds,
    numItems,
    eventSourceUrl,
    eventId,
  } = req.body;

  const userData: Record<string, string[]> = {};
  if (email && typeof email === 'string') userData.em = [sha256(email)];
  if (firstName && typeof firstName === 'string') userData.fn = [sha256(firstName)];
  if (lastName && typeof lastName === 'string') userData.ln = [sha256(lastName)];
  if (country && typeof country === 'string') userData.country = [sha256(country.toLowerCase())];

  const customData: Record<string, unknown> = {};
  if (typeof value === 'number') customData.value = value;
  // Facebook requires uppercase ISO 4217 currency codes (EUR not eur)
  if (typeof currency === 'string') customData.currency = currency.toUpperCase();
  if (Array.isArray(contentIds) && contentIds.length > 0) customData.content_ids = contentIds;
  if (typeof numItems === 'number') customData.num_items = numItems;
  customData.content_type = 'product';

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: eventSourceUrl || '',
        ...(eventId ? { event_id: eventId } : {}),
        user_data: userData,
        custom_data: customData,
      },
    ],
  };

  try {
    const fbRes = await fetch(
      `https://graph.facebook.com/${FB_API_VERSION}/${FB_PIXEL_ID}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const fbData = await fbRes.json();
    res.status(200).json({ ok: fbRes.ok, result: fbData });
  } catch (err: any) {
    res.status(200).json({ ok: false, error: err.message });
  }
});

export default router;
