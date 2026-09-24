import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-primary-950 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="bg-white rounded-lg p-2 inline-block mb-3">
              <img src="/images/logo.png" alt="ADO Palmwinery" className="h-16 w-auto" />
            </div>
            <p className="text-primary-200 text-sm leading-relaxed">
              {t('footer.aboutText')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li><Link to="/products" className="hover:text-white transition-colors">{t('nav.products')}</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">{t('nav.cart')}</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">{t('nav.myOrders')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">{t('footer.contact')}</h4>
            <ul className="space-y-2 text-sm text-primary-200">
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

        <div className="border-t border-primary-800 mt-8 pt-6 text-center text-sm text-primary-300">
          &copy; {new Date().getFullYear()} ADO Palmwinery. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}
