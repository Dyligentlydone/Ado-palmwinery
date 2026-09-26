import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, ArrowLeft, Check } from 'lucide-react';
import { productsAPI } from '../../services/api';
import { Product } from '../../types';
import { useLocale } from '../../context/LocaleContext';
import { useCart } from '../../context/CartContext';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { formatPrice } = useLocale();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productsAPI.getBySlug(slug)
      .then(r => setProduct(r.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addToCart(product, quantity);
      setAdded(true);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 text-sm font-medium">
        <ArrowLeft size={16} /> {t('common.back')} to {t('nav.products')}
      </Link>

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
    </div>
  );
}
