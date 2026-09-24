import { Response, NextFunction } from 'express';
import { AuthRequest, LocaleInfo } from '../types';
import { DEFAULT_CURRENCY, DEFAULT_LANGUAGE, SUPPORTED_CURRENCIES, SUPPORTED_LANGUAGES, SupportedCurrency, SupportedLanguage } from '../config/constants';

// Extend request to include locale
declare global {
  namespace Express {
    interface Request {
      locale?: LocaleInfo;
    }
  }
}

// Map country codes to currencies
const COUNTRY_CURRENCY_MAP: Record<string, SupportedCurrency> = {
  US: 'USD', CA: 'USD', MX: 'USD',
  GB: 'GBP', UK: 'GBP',
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR',
  PT: 'EUR', AT: 'EUR', IE: 'EUR', FI: 'EUR', GR: 'EUR',
};

// Map country codes to languages
const COUNTRY_LANGUAGE_MAP: Record<string, SupportedLanguage> = {
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', PE: 'es', CL: 'es',
  VE: 'es', EC: 'es', GT: 'es', CU: 'es', BO: 'es', DO: 'es',
  HN: 'es', PY: 'es', SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es',
};

export const localeMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Check for explicit overrides in query params or headers
  const queryCurrency = req.query.currency as string | undefined;
  const queryLang = req.query.lang as string | undefined;
  const headerLang = req.headers['accept-language']?.split(',')[0]?.split('-')[0];

  // Determine language
  let language: SupportedLanguage = DEFAULT_LANGUAGE;
  if (queryLang && SUPPORTED_LANGUAGES.includes(queryLang as SupportedLanguage)) {
    language = queryLang as SupportedLanguage;
  } else if (headerLang && SUPPORTED_LANGUAGES.includes(headerLang as SupportedLanguage)) {
    language = headerLang as SupportedLanguage;
  }

  // Determine currency
  let currency: SupportedCurrency = DEFAULT_CURRENCY;
  if (queryCurrency && SUPPORTED_CURRENCIES.includes(queryCurrency as SupportedCurrency)) {
    currency = queryCurrency as SupportedCurrency;
  }

  // Try to detect from country header (set by frontend or CDN)
  const country = req.headers['x-user-country'] as string | undefined;
  if (country) {
    if (!queryCurrency && COUNTRY_CURRENCY_MAP[country]) {
      currency = COUNTRY_CURRENCY_MAP[country];
    }
    if (!queryLang && COUNTRY_LANGUAGE_MAP[country]) {
      language = COUNTRY_LANGUAGE_MAP[country];
    }
  }

  req.locale = { language, currency, country };
  next();
};
