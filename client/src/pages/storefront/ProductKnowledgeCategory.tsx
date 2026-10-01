import { useEffect, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { productsAPI } from '../../services/api';
import { Product } from '../../types';
import ProductCard from '../../components/product/ProductCard';

type Slug = 'palm-sap-wine' | 'palm-gin' | 'sunset-cocktails' | 'merchandise';

// Maps the Product Knowledge categories to the actual DB category slugs that
// should be surfaced for each.
const CATEGORY_CONFIG: Record<Slug, {
  titleKey: string;
  introKey: string;
  productCategorySlugs: string[];
  image: string;
  comingSoonKey?: string;
}> = {
  'palm-sap-wine': {
    titleKey: 'knowledge.palmWineTitle',
    introKey: 'knowledge.palmWineIntro',
    productCategorySlugs: ['vino-de-coyol', 'fruit-infusions'],
    image: '/images/products/palmwine.jpg',
  },
  'palm-gin': {
    titleKey: 'knowledge.palmGinTitle',
    introKey: 'knowledge.palmGinIntro',
    productCategorySlugs: ['palm-spirits'],
    image: '/images/products/el-fuego-gin.jpg',
  },
  'sunset-cocktails': {
    titleKey: 'knowledge.cocktailsTitle',
    introKey: 'knowledge.cocktailsIntro',
    productCategorySlugs: ['cocktails'],
    image: '/images/products/pineapple-sunset.jpg',
  },
  'merchandise': {
    titleKey: 'knowledge.merchTitle',
    introKey: 'knowledge.merchIntro',
    productCategorySlugs: [],
    image: '/images/palms-heritage.png',
    comingSoonKey: 'knowledge.merchComingSoon',
  },
};

export default function ProductKnowledgeCategory() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const config = slug && (slug in CATEGORY_CONFIG) ? CATEGORY_CONFIG[slug as Slug] : null;

  useEffect(() => {
    if (!config || !config.productCategorySlugs.length) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(
      config.productCategorySlugs.map(cs =>
        productsAPI.getAll({ category: cs }).then(r => r.data as Product[]).catch(() => [])
      )
    ).then(results => {
      // Dedupe by id — a product shouldn't appear twice across our bucket categories
      const seen = new Set<string>();
      const combined: Product[] = [];
      for (const list of results) {
        for (const p of list) {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            combined.push(p);
          }
        }
      }
      setProducts(combined);
    }).finally(() => setLoading(false));
  }, [slug]);

  if (!config) {
    return <Navigate to="/product-knowledge" replace />;
  }

  return (
    <div>
      <section className="relative">
        <div className="relative h-56 sm:h-72 overflow-hidden">
          <img src={config.image} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-6">
              <Link
                to="/product-knowledge"
                className="inline-flex items-center gap-1 text-white/85 hover:text-white text-sm mb-3"
              >
                <ArrowLeft size={16} /> {t('knowledge.backToKnowledge')}
              </Link>
              <h1 className="text-3xl sm:text-5xl font-bold text-white drop-shadow-lg font-[family-name:var(--font-heading)]">
                {t(config.titleKey)}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-gray-700 text-lg leading-relaxed">{t(config.introKey)}</p>
      </section>

      {config.comingSoonKey ? (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-[#fdf3d8] rounded-2xl p-8 text-center">
            <p className="text-gray-700">{t(config.comingSoonKey)}</p>
          </div>
        </section>
      ) : (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-[family-name:var(--font-heading)]">
            {t('knowledge.exploreProducts')}
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse" />)}
            </div>
          ) : products.length === 0 ? (
            <p className="text-gray-500">—</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="flex flex-col">
                  <ProductCard product={p} />
                  <Link
                    to={`/products/${p.slug}?from=${slug}`}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
                  >
                    {t('products.details')} <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
