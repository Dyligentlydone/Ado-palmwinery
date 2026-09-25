import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative mt-auto overflow-x-clip">
      {/* The image IS the footer — transparent top lets the page show through
          around the palms, the menu sits directly on the black hills.
          Container crops the empty transparent band at the top of the PNG. */}
      <div className="relative left-1/2 -translate-x-1/2 w-full min-w-[900px] aspect-[186/100]">
        <img
          src="/images/footer.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-bottom select-none pointer-events-none"
        />
      </div>

      {/* Menu overlaid on the hills — no background, just the image */}
      <div className="absolute bottom-0 inset-x-0 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-5 md:pb-10">
          <div className="grid grid-cols-3 gap-3 md:gap-8">
            <div>
              <div className="bg-white rounded-lg p-1.5 md:p-2 inline-block mb-2 md:mb-3">
                <img src="/images/logo.png" alt="ADO Palmwinery" className="h-10 md:h-16 w-auto" />
              </div>
              <p className="hidden sm:block text-white/70 text-xs md:text-sm leading-relaxed">
                {t('footer.aboutText')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2 md:mb-3 text-xs md:text-base">{t('footer.quickLinks')}</h4>
              <ul className="space-y-1.5 md:space-y-2 text-[11px] md:text-sm text-white/70">
                <li><Link to="/products" className="hover:text-white transition-colors">{t('nav.products')}</Link></li>
                <li><Link to="/experience" className="hover:text-white transition-colors">{t('nav.experience')}</Link></li>
                <li><Link to="/cart" className="hover:text-white transition-colors">{t('nav.cart')}</Link></li>
                <li><Link to="/orders" className="hover:text-white transition-colors">{t('nav.myOrders')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 md:mb-3 text-xs md:text-base">{t('footer.contact')}</h4>
              <ul className="space-y-1.5 md:space-y-2 text-[11px] md:text-sm text-white/70">
                <li>info@adopalmwinery.com</li>
                <li>+1 (555) 123-4567</li>
                <li>
                  <Link to="/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
                  {' | '}
                  <Link to="/terms" className="hover:text-white transition-colors">{t('footer.terms')}</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-4 md:mt-8 pt-3 md:pt-6 text-center text-[10px] md:text-sm text-white/50">
            &copy; {new Date().getFullYear()} ADO Palmwinery. {t('footer.rights')}
          </div>
        </div>
      </div>
    </footer>
  );
}
