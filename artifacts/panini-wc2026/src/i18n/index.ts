import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ptBR from './locales/pt-BR.json';
import en from './locales/en.json';
import es from './locales/es.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import it from './locales/it.json';

const resources = {
  'pt-BR': { translation: ptBR },
  en: { translation: en },
  es: { translation: es },
  de: { translation: de },
  fr: { translation: fr },
  it: { translation: it },
};

type SupportedLang = 'pt-BR' | 'en' | 'es' | 'de' | 'fr' | 'it';
const SUPPORTED: SupportedLang[] = ['pt-BR', 'en', 'es', 'de', 'fr', 'it'];

/**
 * Key for EXPLICIT user choices (clicking the language selector).
 * Separate from old auto-saved key to avoid stale 'en' fallbacks
 * from before French/Italian were added to the supported list.
 */
const MANUAL_KEY = '_panini_lng_manual';

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
  DE: 'de', AT: 'de', LI: 'de', CH: 'de',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
  VE: 'es', EC: 'es', BO: 'es', PY: 'es', UY: 'es', CU: 'es',
  DO: 'es', GT: 'es', HN: 'es', SV: 'es', NI: 'es', CR: 'es',
  PA: 'es', PR: 'es', GQ: 'es',
  FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr', CI: 'fr', SN: 'fr',
  CM: 'fr', MA: 'fr', DZ: 'fr', TN: 'fr', BF: 'fr', ML: 'fr',
  NE: 'fr', TD: 'fr', CG: 'fr', CD: 'fr', MG: 'fr', BJ: 'fr',
  GA: 'fr', TG: 'fr', GN: 'fr', RW: 'fr', BI: 'fr', DJ: 'fr',
  KM: 'fr', CF: 'fr', HT: 'fr',
  IT: 'it', SM: 'it', VA: 'it',
};

/**
 * Load explicit manual language choice saved by the language selector.
 * Ignores the legacy auto-saved key (_panini_lng) which could have been
 * set to 'en' as a fallback for FR/IT users before those languages existed.
 */
function loadManual(): SupportedLang | null {
  try {
    const v = localStorage.getItem(MANUAL_KEY);
    return v && SUPPORTED.includes(v as SupportedLang) ? (v as SupportedLang) : null;
  } catch { return null; }
}

/**
 * Persist an EXPLICIT user choice (only called from the language selector).
 * This is the only place we write to storage — auto-detected languages are
 * never persisted so they don't block future correct browser detection.
 */
export function saveExplicitLang(lang: string): void {
  try { localStorage.setItem(MANUAL_KEY, lang); } catch { /* blocked */ }
}

/**
 * Async IP-based detection via ipapi.co.
 * Falls back gracefully; returns null on any failure.
 */
async function detectByIP(): Promise<SupportedLang | null> {
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

    return lang;
  } catch {
    return null;
  }
}

// ─── Language resolution order ────────────────────────────────────────────────
// 1. Explicit manual choice (localStorage MANUAL_KEY) — always wins
// 2. Browser navigator.languages (synchronous, no network)
// 3. IP geolocation (async, only when browser detection was inconclusive)
// 4. English as universal fallback

const browserLangs: readonly string[] =
  typeof navigator !== 'undefined'
    ? (navigator.languages?.length ? [...navigator.languages] : [navigator.language ?? 'en'])
    : ['en'];

const manual = loadManual();
const { lang: browserLang, confident } = pickLanguage(browserLangs);

// Manual explicit choice wins; otherwise use what the browser reports
const initialLang: SupportedLang = manual ?? browserLang;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

// ─── Async IP refinement ──────────────────────────────────────────────────────
// Only fires when there is no manual preference AND the browser provided no
// recognisable language (e.g. user in Japan with browser set to 'ja').
if (!manual && !confident) {
  detectByIP().then(lang => {
    if (lang && lang !== i18n.language) {
      i18n.changeLanguage(lang);
    }
  });
}

export default i18n;
