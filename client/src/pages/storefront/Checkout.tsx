import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, CreditCard, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLocale } from '../../context/LocaleContext';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI, shippingAPI, authAPI } from '../../services/api';
import { Address, ShippingCalculation } from '../../types';

export default function Checkout() {
  const { t } = useTranslation();
  const { cart, refreshCart } = useCart();
  const { formatPrice, currency } = useLocale();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [shipping, setShipping] = useState<ShippingCalculation | null>(null);
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    authAPI.getProfile().then(r => {
      const addrs = r.data.addresses || [];
      setAddresses(addrs);
      const def = addrs.find((a: Address) => a.isDefault);
      if (def) setSelectedAddress(def.id);
      else if (addrs.length > 0) setSelectedAddress(addrs[0].id);
    });
  }, [user, navigate]);

  // Calculate shipping when address changes
  useEffect(() => {
    if (!selectedAddress || !cart?.items.length) return;
    const addr = addresses.find(a => a.id === selectedAddress);
    if (!addr) return;

    const totalWeight = cart.items.reduce((sum, item) => sum + (item.product.weight || 0.5) * item.quantity, 0);
    shippingAPI.calculate({ countryCode: addr.country, weight: totalWeight, currency })
      .then(r => setShipping(r.data))
      .catch(() => setShipping(null));
  }, [selectedAddress, cart, addresses, currency]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <Link to="/products" className="text-primary-600 font-medium hover:underline">Browse Products</Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingCost = shipping?.cost || 0;
  const total = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { setError(t('checkout.selectAddress')); return; }
    setPlacing(true);
    setError('');
    try {
      const res = await ordersAPI.create({ addressId: selectedAddress, currency, notes: notes || undefined });
      await refreshCart();
      const { order, payment } = res.data;
      if (payment?.paymentUrl) {
        window.location.href = payment.paymentUrl;
      } else {
        navigate(`/order-confirmation/${order.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 font-[family-name:var(--font-heading)]">
        {t('checkout.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <MapPin size={20} className="text-primary-600" /> {t('checkout.shipping')}
            </h2>
            {addresses.length === 0 ? (
              <p className="text-gray-500 text-sm">No addresses found. Please add one from your profile.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedAddress === addr.id ? 'border-primary-600 bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{addr.firstName} {addr.lastName}</p>
                      <p className="text-sm text-gray-600">{addr.street}</p>
                      <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.postalCode}</p>
                      <p className="text-sm text-gray-600">{addr.country}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Shipping Info */}
          {shipping && (
            <div className="bg-accent-50 rounded-xl p-4 text-sm">
              <p className="font-medium text-accent-800">
                {shipping.zoneName} - {shipping.estimatedDays}
              </p>
              <p className="text-accent-700">Shipping: {formatPrice(shipping.cost)}</p>
            </div>
          )}

          {/* Payment Method */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <CreditCard size={20} className="text-primary-600" /> {t('checkout.payment')}
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-1">Secure Payment via Tilo Pay</p>
              <p>You will be redirected to Tilo Pay's secure payment page after placing your order.</p>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-3">Order Notes (Optional)</h2>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Any special instructions..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit sticky top-24">
          <h3 className="font-semibold text-gray-900 mb-4">{t('checkout.review')}</h3>
          <div className="space-y-3 mb-4">
            {cart.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate flex-1 mr-2">
                  {item.product.name} x{item.quantity}
                </span>
                <span className="font-medium shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <hr className="my-3" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('cart.subtotal')}</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('cart.shipping')}</span>
              <span className="font-medium">{shipping ? formatPrice(shippingCost) : '...'}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>{t('cart.total')}</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

          <button
            onClick={handlePlaceOrder}
            disabled={placing || !selectedAddress}
            className="w-full mt-6 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {placing ? t('checkout.processing') : <><Check size={18} /> {t('checkout.placeOrder')}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
