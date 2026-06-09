import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import es from './locales/es.json';

const resources = {
  es: { translation: es },
};

// Store is Spanish-only — no language detection needed
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es',
    fallbackLng: 'es',
    interpolation: { escapeValue: false }
  });

// No-op kept for compatibility with any callers
export function saveExplicitLang(_lang: string): void {}

export default i18n;
