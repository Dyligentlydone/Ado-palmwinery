import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Currency, Language, CURRENCY_SYMBOLS } from '../types';

interface LocaleContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  formatPrice: (amount: number, curr?: Currency) => string;
}

const isCostaRica = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone === 'America/Costa_Rica';
  } catch {
    return false;
  }
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>(() =>
    i18n.language?.startsWith('es') ? 'es' : 'en'
  );
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('currency') as Currency | null;
    if (saved) return saved;
    return isCostaRica() ? 'CRC' : 'USD';
  });

  // Keep context in sync if i18n changes language elsewhere
  useEffect(() => {
    const onChange = (lng: string) => setLanguageState(lng.startsWith('es') ? 'es' : 'en');
    i18n.on('languageChanged', onChange);
    return () => { i18n.off('languageChanged', onChange); };
  }, [i18n]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    i18n.changeLanguage(lang); // detector caches write the cookie + localStorage
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('currency', curr);
  };

  const formatPrice = (amount: number | string, curr?: Currency) => {
    const c = curr || currency;
    const symbol = CURRENCY_SYMBOLS[c];
    return `${symbol}${Number(amount).toFixed(2)}`;
  };

  return (
    <LocaleContext.Provider value={{ language, currency, setLanguage, setCurrency, formatPrice }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within LocaleProvider');
  return context;
}
