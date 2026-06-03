import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ptBR from './locales/pt-BR.json';
import en from './locales/en.json';
import es from './locales/es.json';
import de from './locales/de.json';

const resources = {
  'pt-BR': { translation: ptBR },
  en: { translation: en },
  es: { translation: es },
  de: { translation: de }
};

type SupportedLang = 'pt-BR' | 'en' | 'es' | 'de';
const SUPPORTED: SupportedLang[] = ['pt-BR', 'en', 'es', 'de'];

/**
 * Resolves a raw BCP-47 tag to a supported language using:
 *  1. Exact match (case-insensitive, pt-BR == pt-br)
 *  2. All pt-* variants  → pt-BR  (pt-PT, pt-BR, pt, etc.)
 *  3. Language-prefix match: en-CA → en, es-MX → es, de-AT → de
 */
function resolveTag(raw: string): SupportedLang | null {
  const lower = raw.trim().toLowerCase().replace('_', '-');
  const exact = SUPPORTED.find(s => s.toLowerCase() === lower);
  if (exact) return exact;
  const prefix = lower.split('-')[0];
  if (prefix === 'pt') return 'pt-BR';
  return SUPPORTED.find(s => s.toLowerCase().split('-')[0] === prefix) ?? null;
}

/**
 * Walks an ordered candidate list and returns the first supported language.
 * Returns { lang, confident: false } only when no candidate matched at all.
 */
function pickLanguage(candidates: readonly string[]): { lang: SupportedLang; confident: boolean } {
  for (const raw of candidates) {
    const resolved = resolveTag(raw);
    if (resolved) return { lang: resolved, confident: true };
  }
  return { lang: 'en', confident: false };
}

/**
 * Country → language map for IP-based fallback.
 * Only maps to non-English languages; missing entries fall back to English.
 */
const COUNTRY_LANG: Record<string, SupportedLang> = {
  BR: 'pt-BR', PT: 'pt-BR', AO: 'pt-BR', MZ: 'pt-BR', CV: 'pt-BR',
  ST: 'pt-BR', GW: 'pt-BR', TL: 'pt-BR',
  DE: 'de', AT: 'de', CH: 'de', LI: 'de', LU: 'de',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
  VE: 'es', EC: 'es', BO: 'es', PY: 'es', UY: 'es', CU: 'es',
  DO: 'es', GT: 'es', HN: 'es', SV: 'es', NI: 'es', CR: 'es',
  PA: 'es', PR: 'es', GQ: 'es',
};

/**
 * Async IP-based detection via ipapi.co.
 * Uses session storage to avoid repeated network calls on navigation.
 * Returns null on any failure so callers can fall through to 'en'.
 */
const SESSION_KEY = '_panini_lng';

async function detectByIP(): Promise<SupportedLang | null> {
  try {
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached && SUPPORTED.includes(cached as SupportedLang)) {
      return cached as SupportedLang;
    }
  } catch { /* sessionStorage blocked (private mode, etc.) */ }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const data: { country_code?: string; languages?: string } = await res.json();

    let lang: SupportedLang | null = null;

    if (data.languages) {
      const { lang: l, confident } = pickLanguage(data.languages.split(','));
      if (confident) lang = l;
    }

    if (!lang && data.country_code) {
      lang = COUNTRY_LANG[data.country_code] ?? null;
    }

    if (lang) {
      try { sessionStorage.setItem(SESSION_KEY, lang); } catch { /* ignore */ }
    }
    return lang;
  } catch {
    return null;
  }
}

// ─── Synchronous browser detection (no delay to first render) ───────────────

const browserLangs: readonly string[] =
  typeof navigator !== 'undefined'
    ? (navigator.languages?.length ? [...navigator.languages] : [navigator.language ?? 'en'])
    : ['en'];

const { lang: initialLang, confident } = pickLanguage(browserLangs);

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

// ─── Async IP-based refinement ───────────────────────────────────────────────
// Only fires when the browser provided no recognisable language tag,
// so a user in Japan with browser set to 'ja' still gets the right language.
if (!confident) {
  detectByIP().then(lang => {
    if (lang && lang !== i18n.language) {
      i18n.changeLanguage(lang);
    }
  });
}

export default i18n;
