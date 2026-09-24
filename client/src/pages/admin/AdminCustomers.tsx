import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ADMIN';
  phone: string | null;
  createdAt: string;
  orderCount: number;
}

export default function AdminCustomers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getUsers()
      .then(r => setUsers(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <span className="text-sm text-gray-500">{users.length} registered</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-lg h-14 animate-pulse" />)}
        </div>
      ) : users.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No registered customers yet</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
                <th className="text-center px-4 py-3 font-medium">Role</th>
                <th className="text-right px-4 py-3 font-medium">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{u.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
