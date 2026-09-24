import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LocaleProvider } from './context/LocaleContext';
import './i18n';

import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';

import Home from './pages/storefront/Home';
import Products from './pages/storefront/Products';
import ProductDetail from './pages/storefront/ProductDetail';
import CartPage from './pages/storefront/CartPage';
import Checkout from './pages/storefront/Checkout';
import OrderConfirmation from './pages/storefront/OrderConfirmation';
import Orders from './pages/storefront/Orders';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';

import Dashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminShipping from './pages/admin/AdminShipping';
import AdminCustomers from './pages/admin/AdminCustomers';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocaleProvider>
          <CartProvider>
            <Routes>
              {/* Storefront */}
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="shipping" element={<AdminShipping />} />
                <Route path="customers" element={<AdminCustomers />} />
              </Route>
            </Routes>
          </CartProvider>
        </LocaleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
