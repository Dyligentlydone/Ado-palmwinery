import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Package } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { Order } from '../../types';
import { useLocale } from '../../context/LocaleContext';

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { formatPrice } = useLocale();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    ordersAPI.getById(id)
      .then(r => setOrder(r.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500">{t('common.loading')}</div>;
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Order not found</p>
        <Link to="/orders" className="text-primary-600 font-medium hover:underline mt-4 inline-block">View My Orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <CheckCircle size={64} className="mx-auto text-accent-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-heading)]">
        {t('checkout.orderPlaced')}
      </h1>
      <p className="text-gray-600 mb-8">
        {t('checkout.orderNumber')}: <span className="font-bold text-gray-900">{order.orderNumber}</span>
      </p>

      <div className="bg-white rounded-xl border border-gray-100 p-6 text-left mb-8">
        <h3 className="font-semibold mb-4">Order Details</h3>
        <div className="space-y-3">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.productName} x{item.quantity}</span>
              <span className="font-medium">{formatPrice(Number(item.totalPrice))}</span>
            </div>
          ))}
          <hr />
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('cart.subtotal')}</span>
            <span className="font-medium">{formatPrice(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('cart.shipping')}</span>
            <span className="font-medium">{formatPrice(Number(order.shippingCost))}</span>
          </div>
          <hr />
          <div className="flex justify-between font-bold">
            <span>{t('cart.total')}</span>
            <span>{formatPrice(Number(order.total))}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Link to="/orders" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700">
          <Package size={18} /> {t('orders.title')}
        </Link>
        <Link to="/products" className="inline-flex items-center px-6 py-3 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50">
          {t('cart.continueShopping')}
        </Link>
      </div>
    </div>
  );
}
