import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Menu, X, User, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLocale } from '../../context/LocaleContext';
import { Currency, Language } from '../../types';

export default function Header() {
  const { t } = useTranslation();
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { language, currency, setLanguage, setCurrency } = useLocale();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary-700 font-[family-name:var(--font-heading)]">
              ADO Palmwinery
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              {t('nav.home')}
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              {t('nav.products')}
            </Link>
            {user && (
              <Link to="/orders" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                {t('nav.myOrders')}
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Locale Selector */}
            <div className="relative">
              <button
                onClick={() => setLocaleOpen(!localeOpen)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 transition-colors p-2"
              >
                <Globe size={18} />
                <span className="hidden sm:inline">{language.toUpperCase()} / {currency}</span>
                <ChevronDown size={14} />
              </button>
              {localeOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border p-3 z-50">
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Language</p>
                    {(['en', 'es'] as Language[]).map(lang => (
                      <button
                        key={lang}
                        onClick={() => { setLanguage(lang); setLocaleOpen(false); }}
                        className={`block w-full text-left px-2 py-1 rounded text-sm ${language === lang ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-gray-50'}`}
                      >
                        {lang === 'en' ? 'English' : 'Espanol'}
                      </button>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Currency</p>
                    {(['USD', 'EUR', 'GBP'] as Currency[]).map(curr => (
                      <button
                        key={curr}
                        onClick={() => { setCurrency(curr); setLocaleOpen(false); }}
                        className={`block w-full text-left px-2 py-1 rounded text-sm ${currency === curr ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-gray-50'}`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    {t('nav.admin')}
                  </Link>
                )}
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="text-sm text-gray-600 hover:text-primary-600 font-medium flex items-center gap-1">
                  <User size={18} />
                  {t('nav.login')}
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-3">
              <Link to="/" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-primary-600 font-medium">
                {t('nav.home')}
              </Link>
              <Link to="/products" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-primary-600 font-medium">
                {t('nav.products')}
              </Link>
              {user && (
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-primary-600 font-medium">
                  {t('nav.myOrders')}
                </Link>
              )}
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-primary-600 font-medium">
                      {t('nav.admin')}
                    </Link>
                  )}
                  <button onClick={() => { logout(); navigate('/'); setMobileOpen(false); }} className="text-left text-gray-600">
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="text-gray-700 font-medium">{t('nav.login')}</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="text-primary-600 font-medium">{t('nav.register')}</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
