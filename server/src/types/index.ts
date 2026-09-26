import { Request } from 'express';
import { SupportedCurrency, SupportedLanguage } from '../config/constants';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductFilters extends PaginationQuery {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  currency?: SupportedCurrency;
}

export interface OrderFilters extends PaginationQuery {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface LocaleInfo {
  language: SupportedLanguage;
  currency: SupportedCurrency;
  country?: string;
}

// ONVO Pay v1 contract — hosted Checkout (one-time links)
export type OnvoCurrency = 'USD' | 'CRC';
export type OnvoPaymentMethodType = 'card' | 'mobile_number' | 'zunify' | 'bank_deposit';

export interface OnvoLineItem {
  quantity: number;
  unitAmount: number;        // minor units (USD cents / CRC céntimos)
  currency: OnvoCurrency;
  description: string;
  priceType?: 'one_time' | 'recurring';
}

export interface OnvoCheckoutSessionRequest {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  redirectUrl: string;       // success redirect (browser UX only — not trusted)
  cancelUrl: string;         // cancel redirect
  captureMethod?: 'automatic' | 'manual';
  paymentMethodTypes?: OnvoPaymentMethodType[];
  lineItems: OnvoLineItem[]; // at least one, all same currency
  metadata?: Record<string, string>;
}

export interface OnvoCheckoutSession {
  id: string;
  url: string;               // hosted checkout page
  status?: 'open' | 'complete' | 'expired';
  paymentStatus?: 'unpaid' | 'paid';
  paymentIntentId?: string;
  metadata?: Record<string, string>;
  [key: string]: unknown;
}

export interface OnvoPaymentIntent {
  id: string;
  status: 'requires_payment_method' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  amount: number;            // minor units
  currency: string;
  metadata?: Record<string, string>;
  [key: string]: unknown;
}

// Webhook envelope: POST { type, data } with X-Webhook-Secret header
export interface OnvoWebhookEvent {
  type: string;              // e.g. 'payment-intent.succeeded'
  data: {
    id?: string;
    status?: string;
    metadata?: Record<string, string>;
    paymentIntentId?: string;
    [key: string]: unknown;
  };
}

export interface ShippingCalculation {
  cost: number;
  currency: SupportedCurrency;
  estimatedDays: string;
  zoneName: string;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
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
