import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token and locale to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const currency = localStorage.getItem('currency') || 'USD';
  const lang = localStorage.getItem('language') || 'en';
  config.params = { ...config.params, currency, lang };

  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/admin/login') &&
          !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth ---
export const authAPI = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) =>
    api.put('/auth/profile', data),
};

// --- Products ---
export const productsAPI = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get('/products', { params }),
  getBySlug: (slug: string) =>
    api.get(`/products/${slug}`),
  getFeatured: () =>
    api.get('/products/featured'),
  getCategories: () =>
    api.get('/products/categories'),
};

// --- Cart ---
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (productId: string, quantity: number = 1) =>
    api.post('/cart/items', { productId, quantity }),
  updateItem: (itemId: string, quantity: number) =>
    api.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) =>
    api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart'),
};

// --- Orders ---
export const ordersAPI = {
  create: (data: { addressId: string; currency?: string; notes?: string }) =>
    api.post('/orders', data),
  getMy: (params?: Record<string, string | number>) =>
    api.get('/orders/my', { params }),
  getById: (id: string) =>
    api.get(`/orders/my/${id}`),
};

// --- Payments ---
export const paymentsAPI = {
  getStatus: (orderId: string) =>
    api.get(`/payments/status/${orderId}`),
};

// --- Shipping ---
export const shippingAPI = {
  calculate: (data: { countryCode: string; weight: number; currency?: string }) =>
    api.post('/shipping/calculate', data),
  getZones: () => api.get('/shipping/zones'),
};

// --- Admin ---
export const adminAPI = {
  getProducts: (params?: Record<string, string | number>) =>
    api.get('/products/admin/all', { params }),
  createProduct: (data: Record<string, unknown>) =>
    api.post('/products/admin', data),
  updateProduct: (id: string, data: Record<string, unknown>) =>
    api.put(`/products/admin/${id}`, data),
  deleteProduct: (id: string) =>
    api.delete(`/products/admin/${id}`),
  getCategories: () =>
    api.get('/products/admin/categories'),
  createCategory: (data: Record<string, unknown>) =>
    api.post('/products/admin/categories', data),
  updateCategory: (id: string, data: Record<string, unknown>) =>
    api.put(`/products/admin/categories/${id}`, data),
  deleteCategory: (id: string) =>
    api.delete(`/products/admin/categories/${id}`),
  getOrders: (params?: Record<string, string | number>) =>
    api.get('/orders/admin/all', { params }),
  updateOrder: (id: string, data: Record<string, unknown>) =>
    api.put(`/orders/admin/${id}`, data),
  getAnalytics: (days?: number) =>
    api.get('/orders/admin/analytics', { params: { days } }),
  getShippingZones: () =>
    api.get('/shipping/zones'),
  createShippingZone: (data: Record<string, unknown>) =>
    api.post('/shipping/zones', data),
  updateShippingZone: (id: string, data: Record<string, unknown>) =>
    api.put(`/shipping/zones/${id}`, data),
  deleteShippingZone: (id: string) =>
    api.delete(`/shipping/zones/${id}`),
  getUsers: () => api.get('/auth/admin/users'),
};

export default api;
