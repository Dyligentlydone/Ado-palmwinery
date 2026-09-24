import { Fragment, useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Order } from '../../types';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    const params: Record<string, string | number> = { page, limit: 20 };
    if (filter) params.status = filter;
    adminAPI.getOrders(params)
      .then(r => {
        setOrders(r.data.orders);
        setTotalPages(r.data.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page, filter]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await adminAPI.updateOrder(orderId, { status });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order:', err);
    } finally {
      setUpdating(null);
    }
  };

  const updateTracking = async (orderId: string, trackingNumber: string, shippingCarrier: string) => {
    setUpdating(orderId);
    try {
      await adminAPI.updateOrder(orderId, { trackingNumber, shippingCarrier });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update tracking:', err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <select
          value={filter}
          onChange={e => { setFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-lg h-16 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No orders found</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Order</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(order => (
                <Fragment key={order.id}>
                  <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                    <td className="px-4 py-3 font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.user?.firstName} {order.user?.lastName}
                      <br /><span className="text-xs text-gray-400">{order.user?.email}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">${Number(order.total).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <select
                        value={order.status}
                        onClick={e => e.stopPropagation()}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        disabled={updating === order.id}
                        className="text-xs border border-gray-200 rounded px-2 py-1"
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 mb-2">Items</h4>
                            {order.items.map(item => (
                              <p key={item.id} className="text-sm text-gray-700">
                                {item.productName} x{item.quantity} = ${Number(item.totalPrice).toFixed(2)}
                              </p>
                            ))}
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 mb-2">Shipping Address</h4>
                            {order.address && (
                              <div className="text-sm text-gray-700">
                                <p>{order.address.firstName} {order.address.lastName}</p>
                                <p>{order.address.street}</p>
                                <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                                <p>{order.address.country}</p>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 mb-2">Tracking</h4>
                            <form onSubmit={e => {
                              e.preventDefault();
                              const fd = new FormData(e.currentTarget);
                              updateTracking(order.id, fd.get('tracking') as string, fd.get('carrier') as string);
                            }} className="space-y-2">
                              <input name="carrier" defaultValue={order.shippingCarrier || ''} placeholder="Carrier" className="w-full text-sm px-2 py-1 border rounded" />
                              <input name="tracking" defaultValue={order.trackingNumber || ''} placeholder="Tracking #" className="w-full text-sm px-2 py-1 border rounded" />
                              <button type="submit" disabled={updating === order.id} className="text-xs bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700">
                                Save
                              </button>
                            </form>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                          Payment: {order.payment?.status || 'N/A'} | Subtotal: ${Number(order.subtotal).toFixed(2)} | Shipping: ${Number(order.shippingCost).toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${p === page ? 'bg-primary-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
