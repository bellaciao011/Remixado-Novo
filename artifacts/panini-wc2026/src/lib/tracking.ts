const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';

export function utmifyEvent(event: string, params?: Record<string, unknown>, _retries = 0) {
  try {
    // @ts-ignore
    if (typeof window._pixel !== 'undefined' && typeof window._pixel.fire === 'function') {
      // @ts-ignore
      window._pixel.fire(event, params);
    } else if (_retries < 8) {
      setTimeout(() => utmifyEvent(event, params, _retries + 1), 400);
    }
  } catch { /* non-fatal */ }
}

export function fbq(event: string, params?: Record<string, unknown>, _retries = 0) {
  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', event, params);
  } else if (_retries < 8) {
    setTimeout(() => fbq(event, params, _retries + 1), 400);
  }
}

export function gtagEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', eventName, params);
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
