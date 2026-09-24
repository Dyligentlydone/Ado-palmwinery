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

export interface TiloPayCreatePaymentRequest {
  amount: number;
  currency: string;
  description: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  redirectUrl: string;
  callbackUrl: string;
}

export interface TiloPayPaymentResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  paymentUrl?: string;
  [key: string]: unknown;
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
