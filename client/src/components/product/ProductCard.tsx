import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import { useLocale } from '../../context/LocaleContext';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const { formatPrice } = useLocale();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addToCart(product);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAdding(false);
    }
  };

  const isOutOfStock = product.stock <= 0;
  const hasDiscount = product.compareAtUSD && product.compareAtUSD > product.price;

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary-300">
              <Package size={64} />
            </div>
          )}

          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              SALE
            </span>
          )}
          {product.isFeatured && !hasDiscount && (
            <span className="absolute top-3 left-3 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded">
              {t('products.featured')}
            </span>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg">
                {t('products.outOfStock')}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-primary-600 font-medium mb-1">{product.category?.name}</p>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.compareAtUSD!)}
                </span>
              )}
            </div>
            {!isOutOfStock && (
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <ShoppingCart size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function Package({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
