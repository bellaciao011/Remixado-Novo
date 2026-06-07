const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';

// Max 40 retries × 500ms = 20-second window
// Guarantees tracking fires even on slow 3G where window.load can take 10s+
const MAX_RETRIES = 40;
const RETRY_INTERVAL_MS = 500;

export function utmifyEvent(event: string, params?: Record<string, unknown>, _retries = 0) {
  try {
    // @ts-ignore
    if (typeof window._pixel !== 'undefined' && typeof window._pixel.fire === 'function') {
      // @ts-ignore
      window._pixel.fire(event, params);
    } else if (_retries < MAX_RETRIES) {
      setTimeout(() => utmifyEvent(event, params, _retries + 1), RETRY_INTERVAL_MS);
    }
  } catch { /* non-fatal */ }
}

export function fbq(event: string, params?: Record<string, unknown>, _retries = 0) {
  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    // eventID must be passed as the 4th argument to fbq() — NOT inside params —
    // so Facebook can deduplicate pixel events with CAPI server-side events.
    const { eventID, ...rest } = (params || {}) as any;
    if (eventID) {
      (window as any).fbq('track', event, rest, { eventID });
    } else {
      (window as any).fbq('track', event, params);
    }
  } else if (_retries < MAX_RETRIES) {
    setTimeout(() => fbq(event, params, _retries + 1), RETRY_INTERVAL_MS);
  }
}

export async function sendCapiEvent(eventName: string, data: {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  country?: string | null;
  value?: number;
  currency?: string;
  contentIds?: string[];
  numItems?: number;
  eventSourceUrl?: string;
  eventId?: string;
}) {
  try {
    await fetch(`${API_BASE}/api/tracking/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName, ...data }),
    });
  } catch {
    // tracking errors are non-fatal
  }
}
