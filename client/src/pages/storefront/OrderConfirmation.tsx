import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Package } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { Order } from '../../types';
import { useLocale } from '../../context/LocaleContext';
import { useAuth } from '../../context/AuthContext';

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { formatPrice } = useLocale();
  const { user, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || authLoading) return;
    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;   // ~40s total, then stop polling
    const POLL_MS = 4000;

    // Members fetch via the authed endpoint; fall back to the guest link
    // (covers guest orders re-opened after logging in). Both endpoints now
    // reconcile PENDING orders with ONVO server-side, so polling this heals
    // orders whose webhook was delayed by a cold-start.
    const doFetch = () =>
      user
        ? ordersAPI.getById(id).catch(() => ordersAPI.getGuestById(id))
        : ordersAPI.getGuestById(id);

    const run = () => {
      doFetch()
        .then(r => {
          if (cancelled) return;
          setOrder(r.data);
          setLoading(false);
          attempts += 1;
          // Keep polling while status is still pending and we're under the cap
          if (r.data?.status === 'PENDING' && attempts < MAX_ATTEMPTS) {
            setTimeout(run, POLL_MS);
          }
        })
        .catch(() => { if (!cancelled) { setOrder(null); setLoading(false); } });
    };

    run();
    return () => { cancelled = true; };
  }, [id, user, authLoading]);

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500">{t('common.loading')}</div>;
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">{t('checkout.orderNotFound')}</p>
        {user && <Link to="/orders" className="text-primary-600 font-medium hover:underline mt-4 inline-block">{t('checkout.viewMyOrders')}</Link>}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <CheckCircle size={64} className="mx-auto text-accent-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-heading)]">
        {t('checkout.orderPlaced')}
      </h1>
      <p className={`inline-block text-sm font-medium px-4 py-1.5 rounded-full mb-4 ${
        order.status === 'CONFIRMED' ? 'bg-green-100 text-green-800'
        : order.status === 'CANCELLED' ? 'bg-red-100 text-red-800'
        : 'bg-yellow-100 text-yellow-800'
      }`}>
        {order.status === 'CONFIRMED' ? t('checkout.paymentConfirmed')
        : order.status === 'CANCELLED' ? t('checkout.paymentDeclined')
        : t('checkout.paymentPending')}
      </p>
      <p className="text-gray-600 mb-8">
        {t('checkout.orderNumber')}: <span className="font-bold text-gray-900">{order.orderNumber}</span>
      </p>

      <div className="bg-white rounded-xl border border-gray-100 p-6 text-left mb-8">
        <h3 className="font-semibold mb-4">{t('checkout.orderDetails')}</h3>
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
        {user && (
          <Link to="/orders" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700">
            <Package size={18} /> {t('orders.title')}
          </Link>
        )}
        <Link to="/products" className="inline-flex items-center px-6 py-3 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50">
          {t('cart.continueShopping')}
        </Link>
      </div>
    </div>
  );
}
