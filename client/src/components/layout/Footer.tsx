import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const socialIcon = 'w-8 h-8 md:w-9 md:h-9 rounded-full border border-[#3a2413]/25 text-[#3a2413]/70 flex items-center justify-center hover:text-[#3a2413] hover:border-[#3a2413]/50 transition-colors';

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.55-1.5h1.65V4.6c-.3-.04-1.3-.13-2.45-.13-2.45 0-4.1 1.5-4.1 4.2v2.3H7.5V14h2.7v8h3.3z" />
  </svg>
);

const TikTokIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.6 3c.4 2 1.8 3.6 3.9 3.9v3.1c-1.5 0-2.8-.5-3.9-1.2v6.6c0 3.9-2.8 6.6-6.4 6.6-3.5 0-6.2-2.6-6.2-6.1 0-3.4 2.7-6 6.1-6 .3 0 .7 0 1 .1v3.2c-.3-.1-.6-.2-1-.2-1.7 0-3 1.4-3 3 0 1.7 1.3 3 3 3 1.9 0 3.2-1.5 3.2-3.7V3h3.3z" />
  </svg>
);

const chip = 'h-6 md:h-7 px-2.5 rounded bg-white/85 border border-[#3a2413]/10 flex items-center justify-center shadow-sm';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative mt-auto overflow-x-clip">
      {/* The image IS the footer — transparent top lets the page show through
          around the palms, the menu sits directly on the sand dunes.
          pointer-events-none is critical: this div overlaps the page above via
          negative margin, and without it its invisible bounding box swallows
          all touches on the sections underneath. Visual is unchanged — the
          footer nav lives in a separate sibling div below and stays clickable. */}
      <div className="relative left-1/2 -translate-x-1/2 w-full min-w-[900px] aspect-[163/100] -mt-[200px] md:-mt-[250px] pointer-events-none">
        <img
          src="/images/palms.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-bottom select-none pointer-events-none"
        />
      </div>

      {/* Menu overlaid on the dunes — no background, just the image */}
      <div className="absolute bottom-0 inset-x-0 text-[#3a2413]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {/* Top row: brand left, contact right */}
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-xs">
              <img src="/images/logo.png" alt="ADO Palmwinery" className="h-10 md:h-16 w-auto mb-2 md:mb-3" />
              <p className="hidden sm:block text-[#3a2413]/70 text-xs md:text-sm leading-relaxed">
                {t('footer.aboutText')}
              </p>
            </div>

            <div className="text-right">
              <h4 className="font-semibold mb-2 md:mb-3 text-xs md:text-base">{t('footer.contact')}</h4>
              <ul className="space-y-1.5 md:space-y-2 text-[11px] md:text-sm text-[#3a2413]/70">
                <li>info@drinkado.com</li>
                <li>
                  <a href="https://wa.me/50671577049" target="_blank" rel="noopener noreferrer" className="hover:text-[#3a2413] transition-colors">
                    WhatsApp: +506 7157 7049
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Editorial nav strip */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 md:gap-x-9 gap-y-2 mt-4 md:mt-7 uppercase tracking-[0.18em] text-[10px] md:text-xs font-semibold">
            <Link to="/" className="text-[#3a2413]/70 hover:text-[#3a2413] underline-offset-4 decoration-2 decoration-transparent hover:decoration-[#d7b73f] underline transition-all">{t('nav.home')}</Link>
            <span className="hidden md:inline text-[#3a2413]/25 select-none">·</span>
            <Link to="/shop" className="text-[#3a2413]/70 hover:text-[#3a2413] underline-offset-4 decoration-2 decoration-transparent hover:decoration-[#d7b73f] underline transition-all">{t('nav.shop')}</Link>
            <span className="hidden md:inline text-[#3a2413]/25 select-none">·</span>
            <Link to="/about" className="text-[#3a2413]/70 hover:text-[#3a2413] underline-offset-4 decoration-2 decoration-transparent hover:decoration-[#d7b73f] underline transition-all">{t('nav.aboutUs')}</Link>
            <span className="hidden md:inline text-[#3a2413]/25 select-none">·</span>
            <Link to="/product-knowledge" className="text-[#3a2413]/70 hover:text-[#3a2413] underline-offset-4 decoration-2 decoration-transparent hover:decoration-[#d7b73f] underline transition-all">{t('nav.productKnowledge')}</Link>
            <span className="hidden md:inline text-[#3a2413]/25 select-none">·</span>
            <Link to="/news" className="text-[#3a2413]/70 hover:text-[#3a2413] underline-offset-4 decoration-2 decoration-transparent hover:decoration-[#d7b73f] underline transition-all">{t('nav.news')}</Link>
            <span className="hidden md:inline text-[#3a2413]/25 select-none">·</span>
            <Link to="/events" className="text-[#3a2413]/70 hover:text-[#3a2413] underline-offset-4 decoration-2 decoration-transparent hover:decoration-[#d7b73f] underline transition-all">{t('nav.events')}</Link>
            <span className="hidden md:inline text-[#3a2413]/25 select-none">·</span>
            <Link to="/contact" className="text-[#3a2413]/70 hover:text-[#3a2413] underline-offset-4 decoration-2 decoration-transparent hover:decoration-[#d7b73f] underline transition-all">{t('nav.contact')}</Link>
            <span className="hidden md:inline text-[#3a2413]/25 select-none">·</span>
            <Link to="/orders" className="text-[#3a2413]/70 hover:text-[#3a2413] underline-offset-4 decoration-2 decoration-transparent hover:decoration-[#d7b73f] underline transition-all">{t('nav.myOrders')}</Link>
          </nav>

          {/* Social + payment trust badges */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 md:mt-6">
            <div className="flex items-center gap-2.5">
              <a href="https://instagram.com/drinkado" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={socialIcon}>
                <InstagramIcon />
              </a>
              <a href="https://facebook.com/drinkado" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={socialIcon}>
                <FacebookIcon />
              </a>
              <a href="https://tiktok.com/@drinkado" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className={socialIcon}>
                <TikTokIcon />
              </a>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={chip}>
                <svg viewBox="0 0 48 16" className="h-3 md:h-3.5 w-auto" aria-label="Visa">
                  <text x="24" y="13" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontStyle="italic" fontSize="15" fill="#1A1F71">VISA</text>
                </svg>
              </span>
              <span className={chip}>
                <svg viewBox="0 0 36 22" className="h-3.5 md:h-4 w-auto" aria-label="Mastercard">
                  <circle cx="14" cy="11" r="8" fill="#EB001B" />
                  <circle cx="22" cy="11" r="8" fill="#F79E1B" fillOpacity="0.9" />
                </svg>
              </span>
              <span className={chip}>
                <svg viewBox="0 0 52 16" className="h-2.5 md:h-3 w-auto" aria-label="American Express">
                  <rect width="52" height="16" rx="2" fill="#2E77BC" />
                  <text x="26" y="12" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="9.5" fill="#fff">AMEX</text>
                </svg>
              </span>
            </div>
          </div>

          <div className="border-t border-[#3a2413]/15 mt-4 md:mt-8 pt-3 md:pt-6 flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 justify-between text-[10px] md:text-sm text-[#3a2413]/50">
            <span className="order-2 md:order-1">&copy; {new Date().getFullYear()} ADO Palmwinery. {t('footer.rights')}</span>
            <div className="order-1 md:order-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <Link to="/privacy" className="hover:text-[#3a2413] transition-colors">{t('footer.privacy')}</Link>
              <span className="text-[#3a2413]/25">·</span>
              <Link to="/terms" className="hover:text-[#3a2413] transition-colors">{t('footer.terms')}</Link>
              <span className="text-[#3a2413]/25">·</span>
              <Link to="/shipping" className="hover:text-[#3a2413] transition-colors">{t('footer.shipping')}</Link>
            </div>
            <span className="order-3">
              Website by:&nbsp;
              <a href="https://www.dyligent.solutions/" target="_blank" rel="noopener noreferrer" className="text-[#d7b73f] hover:text-[#c9a935] transition-colors">
                {'{'}Dyligent{'}'}
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
