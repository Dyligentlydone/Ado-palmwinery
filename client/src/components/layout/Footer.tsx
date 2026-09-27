import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative mt-auto overflow-x-clip">
      {/* The image IS the footer — transparent top lets the page show through
          around the palms, the menu sits directly on the sand dunes. */}
      <div className="relative left-1/2 -translate-x-1/2 w-full min-w-[900px] aspect-[163/100] -mt-[200px] md:-mt-[250px]">
        <img
          src="/images/palms.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-bottom select-none pointer-events-none"
        />
      </div>

      {/* Menu overlaid on the dunes — no background, just the image */}
      <div className="absolute bottom-0 inset-x-0 text-[#3a2413]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 md:pb-6">
          <div className="grid grid-cols-3 gap-3 md:gap-8">
            <div>
              <img src="/images/logo.png" alt="ADO Palmwinery" className="h-10 md:h-16 w-auto mb-2 md:mb-3" />
              <p className="hidden sm:block text-[#3a2413]/70 text-xs md:text-sm leading-relaxed">
                {t('footer.aboutText')}
              </p>
            </div>

            <div>
              <ul className="space-y-1.5 md:space-y-2 text-[11px] md:text-sm text-[#3a2413]/70">
                <li><Link to="/products" className="hover:text-[#3a2413] transition-colors">{t('nav.products')}</Link></li>
                <li><Link to="/experience" className="hover:text-[#3a2413] transition-colors">{t('nav.experience')}</Link></li>
                <li><Link to="/news" className="hover:text-[#3a2413] transition-colors">{t('nav.news')}</Link></li>
                <li><Link to="/contact" className="hover:text-[#3a2413] transition-colors">{t('nav.contact')}</Link></li>
                <li><Link to="/cart" className="hover:text-[#3a2413] transition-colors">{t('nav.cart')}</Link></li>
                <li><Link to="/orders" className="hover:text-[#3a2413] transition-colors">{t('nav.myOrders')}</Link></li>
              </ul>
            </div>

            <div>
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

          <div className="border-t border-[#3a2413]/15 mt-4 md:mt-8 pt-3 md:pt-6 text-center text-[10px] md:text-sm text-[#3a2413]/50">
            &copy; {new Date().getFullYear()} ADO Palmwinery. {t('footer.rights')}
          </div>
        </div>
      </div>
    </footer>
  );
}
