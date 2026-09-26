import crypto from 'crypto';
import {
  OnvoCheckoutSessionRequest,
  OnvoCheckoutSession,
  OnvoPaymentIntent,
} from '../types';

const ONVO_BASE_URL = process.env.ONVO_BASE_URL || 'https://api.onvopay.com';
const ONVO_SECRET_KEY = process.env.ONVO_SECRET_KEY || '';
const ONVO_WEBHOOK_SECRET = process.env.ONVO_WEBHOOK_SECRET || '';

class OnvoPayService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ONVO_BASE_URL;
  }

  isConfigured(): boolean {
    return Boolean(ONVO_SECRET_KEY);
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ONVO_SECRET_KEY}`,
    };
  }

  // Hosted checkout: returns the session incl. `url` to redirect the customer to.
  // Currencies supported: USD, CRC (CR accounts). Amounts are minor units.
  async createCheckoutSession(data: OnvoCheckoutSessionRequest): Promise<OnvoCheckoutSession> {
    const response = await fetch(`${this.baseUrl}/v1/checkout/sessions/one-time-link`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(data),
    });

    const body = await response.json() as OnvoCheckoutSession & { message?: unknown };
    if (!response.ok || !body.url) {
      throw new Error(`ONVO checkout session failed: ${response.status} - ${JSON.stringify(body)}`);
    }
    return body;
  }

  async getCheckoutSession(id: string): Promise<OnvoCheckoutSession> {
    const response = await fetch(`${this.baseUrl}/v1/checkout/sessions/${id}`, {
      headers: this.headers(),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`ONVO get session failed: ${response.status} - ${body}`);
    }
    return await response.json() as OnvoCheckoutSession;
  }

  // Server-side truth check — used to re-verify webhook claims and reconcile
  // orders whose confirmation events never arrived.
  async getPaymentIntent(id: string): Promise<OnvoPaymentIntent> {
    const response = await fetch(`${this.baseUrl}/v1/payment-intents/${id}`, {
      headers: this.headers(),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`ONVO get intent failed: ${response.status} - ${body}`);
    }
    return await response.json() as OnvoPaymentIntent;
  }

  // Every webhook carries the dashboard-assigned secret in X-Webhook-Secret.
  verifyWebhook(headerSecret: string | undefined): boolean {
    if (!ONVO_WEBHOOK_SECRET || !headerSecret) return false;
    const a = Buffer.from(headerSecret);
    const b = Buffer.from(ONVO_WEBHOOK_SECRET);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
}

export const onvoPayService = new OnvoPayService();
