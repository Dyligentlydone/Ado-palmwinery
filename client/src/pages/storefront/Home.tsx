import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Award, Leaf, Globe } from 'lucide-react';
import { productsAPI } from '../../services/api';
import { Product, Category } from '../../types';
import ProductCard from '../../components/product/ProductCard';
import SunsetIntro from '../../components/intro/SunsetIntro';

export default function Home() {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productsAPI.getFeatured().then(r => setFeatured(r.data)),
      productsAPI.getCategories().then(r => setCategories(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <SunsetIntro />

      {/* Hero Section — continues the sun's glow you just dove through */}
      <section className="relative bg-gradient-to-b from-[#fdf3d8] via-[#fbe8c4] to-[#fefefe]">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-gray-900 font-[family-name:var(--font-heading)]">
              {t('home.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                {t('home.hero.cta')}
              </Link>
              <a
                href="#about"
                className="inline-flex items-center px-8 py-3 border-2 border-gray-900/25 text-gray-900 font-semibold rounded-lg hover:bg-gray-900/5 transition-colors"
              >
                {t('home.hero.secondary')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 font-[family-name:var(--font-heading)]">
            {t('home.featured.title')}
          </h2>
          <p className="text-gray-600 text-lg">{t('home.featured.subtitle')}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl animate-pulse h-80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
          >
            {t('products.title')} &rarr;
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 font-[family-name:var(--font-heading)]">
              {t('home.categories.title')}
            </h2>
            <p className="text-gray-600 text-lg">{t('home.categories.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors">
                  <span className="text-2xl">🌴</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.productCount} {t('products.title').toLowerCase()}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About section */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 font-[family-name:var(--font-heading)]">
            {t('home.about.title')}
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">{t('home.about.text')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Award, title: t('home.about.quality'), text: t('home.about.qualityText') },
            { icon: Leaf, title: t('home.about.sustainable'), text: t('home.about.sustainableText') },
            { icon: Globe, title: t('home.about.worldwide'), text: t('home.about.worldwideText') },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="text-center p-6">
              <div className="w-14 h-14 bg-accent-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon size={28} className="text-accent-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
