import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, ArrowLeft, Check, Wind, GlassWater, Asterisk } from 'lucide-react';
import { productsAPI } from '../../services/api';
import { Product } from '../../types';
import { useLocale } from '../../context/LocaleContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import ProductCard from '../../components/product/ProductCard';
import { PRODUCT_NUTRITION, knowledgeSlugForCategory } from '../../data/nutrition';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { formatPrice } = useLocale();
  const { addToCart } = useCart();
  const { showCartAdded } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setRelated([]);
    setSelectedImage(0);
    setQuantity(1);
    productsAPI.getBySlug(slug)
      .then(r => {
        setProduct(r.data);
        if (r.data.category) {
          productsAPI.getAll({ category: r.data.category.slug, limit: 8 })
            .then(rr => setRelated(
              rr.data.products.filter((p: Product) => p.id !== r.data.id).slice(0, 4)
            ))
            .catch(() => {});
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addToCart(product, quantity);
      setAdded(true);
      showCartAdded(product.name, product.images[0]);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-gray-100 rounded-xl animate-pulse aspect-square" />
          <div className="space-y-4">
            <div className="bg-gray-100 rounded h-8 w-3/4 animate-pulse" />
            <div className="bg-gray-100 rounded h-6 w-1/4 animate-pulse" />
            <div className="bg-gray-100 rounded h-32 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium">
          &larr; {t('cart.continueShopping')}
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const hasDiscount = product.compareAtUSD && product.compareAtUSD > product.price;
  const nutrition = product.slug ? PRODUCT_NUTRITION[product.slug] : undefined;
  const knowledgeSlug = knowledgeSlugForCategory(product.category?.slug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Link to="/shop" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 text-sm font-medium">
          <ArrowLeft size={16} /> {t('common.back')} to {t('nav.shop')}
        </Link>
        <span className="text-gray-300">·</span>
        <Link
          to={`/product-knowledge/${knowledgeSlug}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 text-sm font-medium"
        >
          <ArrowLeft size={16} /> {t('knowledge.backToCategory', { category: product.category?.name })}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl overflow-hidden aspect-square mb-4">
            {product.images[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary-300 text-6xl">
                🌴
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <Link to={`/products?category=${product.category.slug}`} className="text-sm text-primary-600 font-medium hover:underline">
              {product.category.name}
            </Link>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4 font-[family-name:var(--font-heading)]">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(product.compareAtUSD!)}</span>
            )}
            {hasDiscount && (
              <span className="bg-red-100 text-red-700 text-sm font-semibold px-2 py-1 rounded">
                {Math.round((1 - product.price / product.compareAtUSD!) * 100)}% OFF
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* Specs strip: ABV / volume / origin */}
          {(product.abv || product.volumeMl) && (
            <div className="flex divide-x divide-gray-200 border-y border-gray-200 py-4 mb-6">
              {product.abv && (
                <div className="flex-1 text-center px-2">
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">{t('products.abv')}</p>
                  <p className="font-semibold text-gray-900">{product.abv}%</p>
                </div>
              )}
              {product.volumeMl && (
                <div className="flex-1 text-center px-2">
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">{t('products.volume')}</p>
                  <p className="font-semibold text-gray-900">{product.volumeMl} ml</p>
                </div>
              )}
              <div className="flex-1 text-center px-2">
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">{t('products.origin')}</p>
                <p className="font-semibold text-gray-900">{t('products.originValue')}</p>
              </div>
            </div>
          )}

          {/* Stock status */}
          <div className="mb-6">
            {isOutOfStock ? (
              <span className="text-red-600 font-medium">{t('products.outOfStock')}</span>
            ) : (
              <span className="text-accent-600 font-medium flex items-center gap-1">
                <Check size={16} /> {t('products.inStock')} ({product.stock} available)
              </span>
            )}
          </div>

          {/* Quantity & Add to cart */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50"
                >
                  -
                </button>
                <span className="px-4 py-2 font-medium text-gray-900 min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  added
                    ? 'bg-accent-600 text-white'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                } disabled:opacity-50`}
              >
                {added ? (
                  <><Check size={20} /> Added!</>
                ) : (
                  <><ShoppingCart size={20} /> {t('products.addToCart')}</>
                )}
              </button>
            </div>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-4">SKU: {product.sku}</p>
        </div>
      </div>

      {/* Tasting notes */}
      {(product.nose || product.palate || product.finish) && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-[family-name:var(--font-heading)]">
            {t('products.tastingNotes')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { label: t('products.nose'), text: product.nose, Icon: Wind },
              { label: t('products.palate'), text: product.palate, Icon: GlassWater },
              { label: t('products.finish'), text: product.finish, Icon: Asterisk },
            ].filter(n => n.text).map(({ label, text, Icon }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <Icon size={36} strokeWidth={1.25} className="text-primary-600 mb-3" />
                <p className="text-xs uppercase tracking-widest text-primary-600 font-semibold mb-2">{label}</p>
                <p className="text-gray-700 font-medium">{text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Nutritional overview */}
      {nutrition && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-heading)]">
            {t('knowledge.nutritionTitle')}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {t('knowledge.servingSize')}: {nutrition.servingSizeMl} ml
            {product.abv ? ` · ${t('knowledge.alcoholContent')}: ${product.abv}% ABV` : ''}
          </p>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-gray-100">
              {[
                { label: t('knowledge.calories'), value: `${nutrition.caloriesKcal} kcal` },
                { label: t('knowledge.carbs'), value: `${nutrition.carbsG} g` },
                { label: t('knowledge.sugar'), value: `${nutrition.sugarG} g` },
                { label: t('knowledge.protein'), value: `${nutrition.proteinG} g` },
                { label: t('knowledge.fat'), value: `${nutrition.fatG} g` },
                { label: t('knowledge.sodium'), value: `${nutrition.sodiumMg} mg` },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">{label}</p>
                  <p className="font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">{t('knowledge.nutritionNote')}</p>
        </section>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-[family-name:var(--font-heading)]">
            {t('products.pairsWith')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
