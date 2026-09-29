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

      {/* Hero — the same sunset you dove through becomes the header backdrop,
          its glow melting into the page cream */}
      <section className="relative">
        <div className="relative h-[62vh] min-h-[420px] md:h-[72vh] overflow-hidden">
          <img
            src="/images/sunset-intro.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-[50%_58%]"
          />
          {/* Warm veil — mutes the image so the white copy and buttons read cleanly */}
          <div className="absolute inset-0 bg-[#1d0a02]/[0.69]" />
          {/* Sun-glow: cream radiates from the sun so the fade follows the image's own light */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 55% 42% at 50% 66%, rgba(253,243,216,0.85) 0%, rgba(253,243,216,0.4) 45%, rgba(253,243,216,0) 72%)',
            }}
          />
          {/* Linear finish — guarantees the bottom edge is exactly the page cream */}
          <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-b from-transparent via-[#fdf3d8]/50 to-[#fdf3d8]" />

          {/* Hero copy — overlaid on the image, biased above the sun glow */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
              <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg font-[family-name:var(--font-heading)]">
                  {t('home.hero.title')}
                </h1>
                <p className="text-lg md:text-xl text-white/85 mb-8 leading-relaxed drop-shadow">
                  {t('home.hero.subtitle')}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    to="/products"
                    className="inline-flex items-center px-8 py-3 bg-gray-900/90 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    {t('home.hero.cta')}
                  </Link>
                  <Link
                    to="/experience"
                    className="inline-flex items-center px-8 py-3 border-2 border-white/70 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
                  >
                    {t('home.hero.secondary')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The melt continues down behind the heritage section — no hard edge */}
        <div className="relative bg-gradient-to-b from-[#fdf3d8] via-[#fbe8c4] to-[#fefefe] pt-px">
          {/* Our Heritage — palms photo left, story right, value cards below */}
          <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-4 md:pt-6 -mt-12 md:-mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center mb-14">
          <div>
            <img
              src="/images/palms-heritage.png"
              alt="Palm groves at golden hour"
              className="w-full max-w-md mx-auto md:max-w-none"
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-[family-name:var(--font-heading)]">
              {t('home.about.title')}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">{t('home.about.text')}</p>
          </div>
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
      <section className="bg-gray-50 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 font-[family-name:var(--font-heading)]">
              {t('home.categories.title')}
            </h2>
            <p className="text-gray-600 text-lg">{t('home.categories.subtitle')}</p>
          </div>

          {/* Mobile: horizontal snap carousel / Desktop: grid */}
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group shrink-0 w-56 snap-start md:w-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow"
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
    </div>
  );
}
