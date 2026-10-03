import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // On the homepage the header floats over the sunset image until you scroll
  const overImage = isHome && !scrolled && !mobileOpen;

  const navLink = overImage
    ? 'text-white/90 hover:text-white transition-colors text-sm font-medium drop-shadow-sm whitespace-nowrap'
    : 'text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium whitespace-nowrap';
  const iconBtn = overImage
    ? 'p-2 text-white/90 hover:text-white transition-colors'
    : 'p-2 text-gray-600 hover:text-primary-600 transition-colors';
  const subtleLink = overImage
    ? 'text-sm text-white/80 hover:text-white transition-colors drop-shadow-sm'
    : 'text-sm text-gray-600 hover:text-primary-600 transition-colors';

  // Owner-specified nav order. Items whose visibility depends on auth are
  // added conditionally below.
  const navItems: Array<{ to: string; labelKey: string; show?: boolean }> = [
    { to: '/', labelKey: 'nav.home' },
    { to: '/shop', labelKey: 'nav.shop' },
    { to: '/login', labelKey: 'nav.loginRegister', show: !user },
    { to: '/orders', labelKey: 'nav.myOrders', show: !!user },
    { to: '/about', labelKey: 'nav.aboutUs' },
    { to: '/product-knowledge', labelKey: 'nav.productKnowledge' },
    { to: '/news', labelKey: 'nav.news' },
    { to: '/events', labelKey: 'nav.events' },
    { to: '/contact', labelKey: 'nav.contact' },
  ];

  const visibleNav = navItems.filter(n => n.show !== false);

  return (
    <header
      className={`relative z-50 transition-colors duration-300 ${isHome ? '-mb-16' : ''} ${
        overImage ? 'bg-transparent' : 'bg-[#fdf3d8]/95 backdrop-blur-sm shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/images/logo.png" alt="ADO Palmwinery" className="h-12 w-auto rounded-lg" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-5 flex-1 justify-center">
            {visibleNav.map(item => (
              <Link key={item.to} to={item.to} className={navLink}>{t(item.labelKey)}</Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Locale Selector */}
            <div className="relative">
              <button
                onClick={() => setLocaleOpen(!localeOpen)}
                className={`${iconBtn} flex items-center gap-1 text-sm`}
              >
                <Globe size={18} />
                <span className="hidden sm:inline">{language.toUpperCase()} / {currency}</span>
                <ChevronDown size={14} />
              </button>
              {localeOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border p-3 z-50">
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Language</p>
                    {(['en', 'es', 'fr'] as Language[]).map(lang => (
                      <button
                        key={lang}
                        onClick={() => { setLanguage(lang); setLocaleOpen(false); }}
                        className={`block w-full text-left px-2 py-1 rounded text-sm ${language === lang ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {{ en: 'English', es: 'Español', fr: 'Français' }[lang]}
                      </button>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Currency</p>
                    {(['USD', 'EUR', 'GBP', 'CRC'] as Currency[]).map(curr => (
                      <button
                        key={curr}
                        onClick={() => { setCurrency(curr); setLocaleOpen(false); }}
                        className={`block w-full text-left px-2 py-1 rounded text-sm ${currency === curr ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" className={`${iconBtn} relative`}>
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User menu (desktop) */}
            {user && (
              <div className="hidden lg:flex items-center gap-3">
                <Link to="/account" className={subtleLink}>
                  <span className="hidden xl:inline">{user.firstName || t('nav.account')}</span>
                  <User className="xl:hidden" size={18} />
                </Link>
                {isAdmin && (
                  <Link to="/admin" className={`text-sm font-medium ${overImage ? 'text-white hover:text-white/80 drop-shadow-sm' : 'text-primary-600 hover:text-primary-700'}`}>
                    {t('nav.admin')}
                  </Link>
                )}
                <button onClick={() => { logout(); navigate('/'); }} className={subtleLink}>
                  {t('nav.logout')}
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className={`lg:hidden ${iconBtn}`}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#fdf3d8] border-t border-black/5 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-3">
            {visibleNav.map(item => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="text-gray-700 hover:text-primary-600 font-medium"
              >
                {t(item.labelKey)}
              </Link>
            ))}
            {user && (
              <>
                <Link to="/account" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-primary-600 font-medium">
                  {t('nav.account')}
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-primary-600 font-medium">
                    {t('nav.admin')}
                  </Link>
                )}
                <button onClick={() => { logout(); navigate('/'); setMobileOpen(false); }} className="text-left text-gray-600 hover:text-primary-600">
                  {t('nav.logout')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
