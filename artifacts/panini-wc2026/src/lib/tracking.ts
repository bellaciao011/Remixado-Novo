const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';

export function utmifyEvent(event: string, params?: Record<string, unknown>) {
  try {
    // @ts-ignore
    if (typeof window._pixel !== 'undefined' && typeof window._pixel.fire === 'function') {
      // @ts-ignore
      window._pixel.fire(event, params);
    }
  } catch { /* non-fatal */ }
}

export function fbq(event: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', event, params);
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
