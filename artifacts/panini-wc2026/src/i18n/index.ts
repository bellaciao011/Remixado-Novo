import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './locales/de.json';

const resources = {
  de: { translation: de },
};

// Store is German-only — no language detection needed
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'de',
    fallbackLng: 'de',
    interpolation: { escapeValue: false }
  });

// No-op kept for compatibility with any callers
export function saveExplicitLang(_lang: string): void {}

export default i18n;
