import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Package } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { adminAPI } from '../../services/api';
import { AnalyticsData } from '../../types';

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    adminAPI.getAnalytics(days)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading || !data) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl h-28 animate-pulse" />)}
        </div>
      </div>
    );
  }

  const CUR_SYM: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', CRC: '₡' };
  const CUR_COLORS = ['#c46823', '#2563eb', '#16a34a', '#9333ea'];
  const fmt = (cur: string, n: number) => `${CUR_SYM[cur] || ''}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${cur}`;

  const revenueCards = data.byCurrency.length > 0
    ? data.byCurrency
    : [{ currency: 'USD', revenue: 0, orders: 0, averageOrderValue: 0 }];

  const statCards = [
    ...revenueCards.map(c => ({
      label: `Revenue (${c.currency})`,
      value: fmt(c.currency, c.revenue),
      sub: `avg ${fmt(c.currency, c.averageOrderValue)} / order`,
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
    })),
    { label: 'Total Orders', value: String(data.totalOrders), sub: '', icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Products Sold', value: String(data.totalUnitsSold), sub: '', icon: Package, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <select
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                {sub && <p className="text-xs text-gray-400">{sub}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              {data.currencies.map((cur, i) => (
                <Area
                  key={cur}
                  type="monotone"
                  dataKey={cur}
                  name={cur}
                  stackId="1"
                  stroke={CUR_COLORS[i % CUR_COLORS.length]}
                  fill={CUR_COLORS[i % CUR_COLORS.length]}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Orders Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#c46823" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products & Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-3">
            {data.topProducts.map((p, i) => (
              <div key={p.productId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-900 font-medium">{p.productName}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{CUR_SYM[p.currency] || ''}{p.revenue.toFixed(2)} {p.currency}</p>
                  <p className="text-xs text-gray-500">{p.totalSold} sold</p>
                </div>
              </div>
            ))}
            {data.topProducts.length === 0 && <p className="text-sm text-gray-500">No data yet</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {Object.entries(data.ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{status}</span>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
            ))}
            {Object.keys(data.ordersByStatus).length === 0 && <p className="text-sm text-gray-500">No orders yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
