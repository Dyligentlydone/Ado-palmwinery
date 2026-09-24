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

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem('language') as Language) || 'en'
  );
  const [currency, setCurrencyState] = useState<Currency>(
    () => (localStorage.getItem('currency') as Currency) || 'USD'
  );

  // Auto-detect from browser on first visit
  useEffect(() => {
    if (!localStorage.getItem('language')) {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'es') {
        setLanguageState('es');
        localStorage.setItem('language', 'es');
        i18n.changeLanguage('es');
      }
    }
  }, [i18n]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
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
