import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import es from './locales/es.json';

// Country hint without any GeoIP API: Costa Rica timezone → Spanish
const timezoneDetector = {
  name: 'timezone',
  lookup() {
    try {
      if (Intl.DateTimeFormat().resolvedOptions().timeZone === 'America/Costa_Rica') {
        return 'es';
      }
    } catch {
      // timezone unavailable — ignore
    }
    return undefined;
  },
  cacheUserLanguage() {},
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector(timezoneDetector);

i18n
  .use(languageDetector)
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
      // Saved choice always wins: cookie → localStorage → CR timezone → browser language → fallback en
      order: ['cookie', 'localStorage', 'timezone', 'navigator'],
      lookupCookie: 'language',
      lookupLocalStorage: 'language',
      caches: ['cookie', 'localStorage'],
    },
  });

export default i18n;
