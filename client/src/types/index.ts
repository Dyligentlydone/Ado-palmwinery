export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'CUSTOMER';
  phone?: string;
  createdAt?: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  userId: string;
  label?: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: Currency;
  compareAtUSD?: number;
  images: string[];
  category?: Category;
  categoryId: string;
  sku: string;
  stock: number;
  weight?: number;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: Product;
}

export interface Payment {
  id: string;
  orderId: string;
  tiloPaymentId?: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  method?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  currency: Currency;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  notes?: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  createdAt: string;
  items: OrderItem[];
  payment?: Payment;
  address?: Address;
  user?: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'>;
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CRC';
export type Language = 'en' | 'es';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface PaginatedResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  [key: string]: T[] | PaginatedResponse<T>['pagination'];
}

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalUnitsSold: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
  ordersByStatus: Record<string, number>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface ShippingCalculation {
  cost: number;
  currency: Currency;
  estimatedDays: string;
  zoneName: string;
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '\u20ac',
  GBP: '\u00a3',
  CRC: '\u20a1',
};
