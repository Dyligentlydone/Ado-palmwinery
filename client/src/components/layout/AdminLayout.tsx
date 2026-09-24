import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { BarChart3, Package, ShoppingBag, Truck, LogOut, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', icon: BarChart3, label: 'Dashboard', exact: true },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/shipping', icon: Truck, label: 'Shipping' },
];

export default function AdminLayout() {
  const { user, isAdmin, logout, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">Loading...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-950 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold font-[family-name:var(--font-heading)]">ADO Admin</h1>
          <p className="text-primary-300 text-sm mt-1">{user.email}</p>
        </div>

        <nav className="flex-1 px-3">
          {navItems.map(({ to, icon: Icon, label, exact }) => {
            const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-700 text-white' : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-primary-800">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-primary-200 hover:text-white text-sm transition-colors">
            <Home size={18} /> View Store
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 text-primary-200 hover:text-white text-sm w-full transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
