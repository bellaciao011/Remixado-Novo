---
name: Purchase tracking reliability
description: Root causes and fixes for missed Purchase events in pixel/CAPI tracking
---

## Rules

1. **UTMify window._pixel race condition**: pixel.js loads async; useEffect on confirmation page may fire before _pixel is ready. Fix: retry loop (8x at 400ms) in utmifyEvent().

2. **Duplicate FB Pixel**: UTMify pixel.js auto-calls fbq('init', pixelId) after fetching the linked FB Pixel ID from UTMify servers. index.html must NOT also call fbq('init') — keep only the fbq stub snippet (loads fbevents.js + defines window.fbq) without the init/PageView calls.

3. **event_id deduplication**: Both client-side fbq('track','Purchase',{eventID}) and server-side CAPI must share the same event_id = `purchase_${paymentIntentId}` so Meta deduplicates instead of double-counting.

4. **Server-side CAPI fallback**: WebhookHandlers.firePurchaseCapi() fires on payment_intent.succeeded webhook — fires even if user closes browser before confirmation page. Requires FB_CAPI_ACCESS_TOKEN secret.

**Why:** One real sale was not tracked; root causes were the race condition + missing CAPI token + no server-side fallback.

**How to apply:** Any new tracking event that fires on the confirmation page needs the same retry pattern. Any new Pixel event paired with CAPI needs matching event_id.
