import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Wine, Flame, Sunset, ShoppingBag } from 'lucide-react';

const CATEGORIES = [
  {
    slug: 'palm-sap-wine',
    icon: Wine,
    titleKey: 'knowledge.palmWineTitle',
    textKey: 'knowledge.palmWineIntro',
    image: '/images/products/palmwine.jpg',
  },
  {
    slug: 'palm-gin',
    icon: Flame,
    titleKey: 'knowledge.palmGinTitle',
    textKey: 'knowledge.palmGinIntro',
    image: '/images/products/el-fuego-gin.jpg',
  },
  {
    slug: 'sunset-cocktails',
    icon: Sunset,
    titleKey: 'knowledge.cocktailsTitle',
    textKey: 'knowledge.cocktailsIntro',
    image: '/images/products/pineapple-sunset.jpg',
  },
  {
    slug: 'merchandise',
    icon: ShoppingBag,
    titleKey: 'knowledge.merchTitle',
    textKey: 'knowledge.merchIntro',
    image: '/images/palms-heritage.png',
  },
];

export default function ProductKnowledge() {
  const { t } = useTranslation();

  return (
    <div>
      <section className="bg-gradient-to-b from-[#fdf3d8] to-white py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
            {t('knowledge.title')}
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t('knowledge.subtitle')}</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {CATEGORIES.map(({ slug, icon: Icon, titleKey, textKey, image }) => (
            <Link
              key={slug}
              to={`/product-knowledge/${slug}`}
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                <img
                  src={image}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-700">
                    <Icon size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors font-[family-name:var(--font-heading)]">
                    {t(titleKey)}
                  </h2>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{t(textKey)}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
                  {t('knowledge.exploreCategory')}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
