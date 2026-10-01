import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LocaleProvider } from './context/LocaleContext';
import { ToastProvider } from './context/ToastContext';
import './i18n';

import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/storefront/Home';
import Products from './pages/storefront/Products';
import ProductDetail from './pages/storefront/ProductDetail';
import CartPage from './pages/storefront/CartPage';
import Checkout from './pages/storefront/Checkout';
import OrderConfirmation from './pages/storefront/OrderConfirmation';
import Orders from './pages/storefront/Orders';
import Account from './pages/storefront/Account';
import News from './pages/storefront/News';
import About from './pages/storefront/Experience';
import Contact from './pages/storefront/Contact';
import Legal from './pages/storefront/Legal';
import ProductKnowledge from './pages/storefront/ProductKnowledge';
import ProductKnowledgeCategory from './pages/storefront/ProductKnowledgeCategory';
import Events from './pages/storefront/Events';
import EventDetail from './pages/storefront/EventDetail';

import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminLogin from './pages/auth/AdminLogin';

import Dashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminShipping from './pages/admin/AdminShipping';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminMessages from './pages/admin/AdminMessages';
import AdminSettings from './pages/admin/AdminSettings';
import AdminEvents from './pages/admin/AdminEvents';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <LocaleProvider>
          <CartProvider>
            <ToastProvider>
            <Routes>
              {/* Storefront */}
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/shop" element={<Products />} />
                <Route path="/about" element={<About />} />
                <Route path="/experience" element={<About />} />
                <Route path="/product-knowledge" element={<ProductKnowledge />} />
                <Route path="/product-knowledge/:slug" element={<ProductKnowledgeCategory />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:slug" element={<EventDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/account" element={<Account />} />
                <Route path="/news" element={<News />} />
                <Route path="/privacy" element={<Legal />} />
                <Route path="/terms" element={<Legal />} />
                <Route path="/shipping" element={<Legal />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="shipping" element={<AdminShipping />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
            </ToastProvider>
          </CartProvider>
        </LocaleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
