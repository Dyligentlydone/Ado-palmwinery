import crypto from 'crypto';
import { TiloPayCreatePaymentRequest, TiloPayPaymentResponse } from '../types';

const TILO_PAY_BASE_URL = process.env.TILO_PAY_BASE_URL || 'https://api.tilopay.com/v1';
const TILO_PAY_API_KEY = process.env.TILO_PAY_API_KEY || '';
const TILO_PAY_SECRET_KEY = process.env.TILO_PAY_SECRET_KEY || '';

class TiloPayService {
  private baseUrl: string;
  private apiKey: string;
  private secretKey: string;

  constructor() {
    this.baseUrl = TILO_PAY_BASE_URL;
    this.apiKey = TILO_PAY_API_KEY;
    this.secretKey = TILO_PAY_SECRET_KEY;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Api-Key': this.secretKey,
    };
  }

  async createPayment(data: TiloPayCreatePaymentRequest): Promise<TiloPayPaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          reference: data.orderId,
          customer: {
            email: data.customerEmail,
            name: data.customerName,
          },
          redirect_url: data.redirectUrl,
          callback_url: data.callbackUrl,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Tilo Pay API error: ${response.status} - ${errorBody}`);
      }

      return await response.json() as TiloPayPaymentResponse;
    } catch (error) {
      console.error('Tilo Pay create payment error:', error);
      throw error;
    }
  }

  async getPayment(paymentId: string): Promise<TiloPayPaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Tilo Pay API error: ${response.status} - ${errorBody}`);
      }

      return await response.json() as TiloPayPaymentResponse;
    } catch (error) {
      console.error('Tilo Pay get payment error:', error);
      throw error;
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<TiloPayPaymentResponse> {
    try {
      const body: Record<string, unknown> = {};
      if (amount) body.amount = amount;

      const response = await fetch(`${this.baseUrl}/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Tilo Pay refund error: ${response.status} - ${errorBody}`);
      }

      return await response.json() as TiloPayPaymentResponse;
    } catch (error) {
      console.error('Tilo Pay refund error:', error);
      throw error;
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const webhookSecret = process.env.TILO_PAY_WEBHOOK_SECRET || '';
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

export const tiloPayService = new TiloPayService();
