import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2, ShoppingBag, Minus, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLocale } from '../../context/LocaleContext';

export default function CartPage() {
  const { t } = useTranslation();
  const { cart, updateItem, removeItem, isLoading } = useCart();
  const { formatPrice } = useLocale();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        {t('common.loading')}
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('cart.empty')}</h2>
        <Link to="/products" className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 mt-4">
          {t('cart.continueShopping')}
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 font-[family-name:var(--font-heading)]">
        {t('cart.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => (
            <div key={item.id} className="flex gap-4 bg-white rounded-xl border border-gray-100 p-4">
              <div className="w-24 h-24 bg-primary-50 rounded-lg overflow-hidden shrink-0">
                {item.product.images[0] ? (
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🌴</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product.slug}`} className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-1">
                  {item.product.name}
                </Link>
                <p className="text-sm text-gray-500 mt-1">{item.product.category?.name}</p>
                <p className="font-bold text-gray-900 mt-1">{formatPrice(item.product.price)}</p>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                    className="p-1.5 text-gray-600 hover:bg-gray-50"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3 text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateItem(item.id, item.quantity + 1)}
                    className="p-1.5 text-gray-600 hover:bg-gray-50"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit">
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('cart.subtotal')}</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('cart.shipping')}</span>
              <span className="text-gray-500">Calculated at checkout</span>
            </div>
            <hr />
            <div className="flex justify-between text-base font-bold">
              <span>{t('cart.total')}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="block w-full mt-6 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 text-center transition-colors"
          >
            {t('cart.checkout')}
          </Link>
          <Link
            to="/products"
            className="block w-full mt-3 text-center text-sm text-primary-600 hover:underline"
          >
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>
    </div>
  );
}
