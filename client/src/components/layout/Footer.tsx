import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
                <li>info@adopalmwinery.com</li>
                <li>
                  <a href="https://wa.me/50671577049" target="_blank" rel="noopener noreferrer" className="hover:text-[#3a2413] transition-colors">
                    WhatsApp: +506 7157 7049
                  </a>
                  <p className="text-[#3a2413]/50 text-[10px] md:text-xs mt-0.5">{t('contact.directLine')}</p>
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
