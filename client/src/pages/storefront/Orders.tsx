import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { Order } from '../../types';
import { useLocale } from '../../context/LocaleContext';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

export default function Orders() {
  const { t } = useTranslation();
  const { formatPrice } = useLocale();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getMy()
      .then(r => setOrders(r.data.orders))
      .finally(() => setLoading(false));
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 font-[family-name:var(--font-heading)]">
        {t('orders.title')}
      </h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 rounded-xl animate-pulse h-24" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">{t('orders.noOrders')}</p>
          <Link to="/products" className="text-primary-600 font-medium hover:underline">{t('cart.continueShopping')}</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link
              key={order.id}
              to={`/order-confirmation/${order.id}`}
              className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString()} - {order.items.length} {t('orders.items').toLowerCase()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-gray-900">{formatPrice(Number(order.total))}</span>
                </div>
              </div>
              {order.trackingNumber && (
                <p className="text-xs text-gray-500 mt-2">
                  {t('orders.tracking')}: {order.shippingCarrier} - {order.trackingNumber}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
