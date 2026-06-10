import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fr from './locales/fr.json';

const resources = {
  fr: { translation: fr },
};

// Store is French-only — no language detection needed
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: { escapeValue: false }
  });

// No-op kept for compatibility with any callers
export function saveExplicitLang(_lang: string): void {}

export default i18n;
