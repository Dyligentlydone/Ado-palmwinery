import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import es from './locales/es.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    interpolation: { escapeValue: false },
    detection: {
      // Saved choice always wins: cookie → localStorage → browser language → English fallback.
      // (Timezone heuristic removed — was returning inconsistent results across devices.)
      order: ['cookie', 'localStorage', 'navigator'],
      lookupCookie: 'language',
      lookupLocalStorage: 'language',
      caches: ['cookie', 'localStorage'],
    },
  });

export default i18n;
