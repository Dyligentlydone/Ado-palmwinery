import { Request, Response } from 'express';
import prisma from '../config/database';
import { onvoPayService } from '../services/onvopay';
import { OnvoWebhookEvent } from '../types';

// Marks an order paid and stores the ONVO payment intent id.
async function markPaid(orderId: string, intentId: string | undefined, payload: unknown) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
  if (!order || order.status !== 'PENDING') return;
  await prisma.$transaction([
    order.payment
      ? prisma.payment.update({
          where: { orderId: order.id },
          data: { status: 'COMPLETED', tiloPaymentId: intentId, tiloPayResponse: payload as any },
        })
      : prisma.payment.create({
          data: { orderId: order.id, tiloPaymentId: intentId, amount: order.total, currency: order.currency, status: 'COMPLETED', tiloPayResponse: payload as any },
        }),
    prisma.order.update({ where: { id: order.id }, data: { status: 'CONFIRMED' } }),
  ]);
}

// Marks an order declined and releases reserved stock — only when the failure
// is confirmed by ONVO, never from a browser redirect.
async function markFailed(orderId: string, intentId: string | undefined, payload: unknown) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true, items: true },
  });
  if (!order || order.status !== 'PENDING') return;
  await prisma.$transaction([
    order.payment
      ? prisma.payment.update({
          where: { orderId: order.id },
          data: { status: 'FAILED', tiloPaymentId: intentId, tiloPayResponse: payload as any },
        })
      : prisma.payment.create({
          data: { orderId: order.id, tiloPaymentId: intentId, amount: order.total, currency: order.currency, status: 'FAILED', tiloPayResponse: payload as any },
        }),
    prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } }),
    ...order.items.map(item =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
    ),
  ]);
}

// Finds the order for a webhook payload. Preferred path is metadata.orderId
// (set on the checkout session); falls back to matching a stored session id.
async function findOrderForEvent(data: OnvoWebhookEvent['data']) {
  const metaOrderId = data?.metadata?.orderId;
  if (metaOrderId) {
    const order = await prisma.order.findUnique({ where: { id: metaOrderId } });
    if (order) return order;
  }
  if (data?.id) {
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { tiloPaymentId: data.id },
          { tiloPayResponse: { path: ['sessionId'], equals: data.id } },
        ],
      },
      include: { order: true },
    });
    if (payment?.order) return payment.order;
  }
  return null;
}

// ONVO sends { type, data } POSTs with the dashboard-assigned secret in
// X-Webhook-Secret. Verified events are then re-checked against the API where
// possible before mutating orders. All transitions are idempotent — replayed
// or duplicate events hit the status guards and become no-ops.
export const handleOnvoWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!onvoPayService.verifyWebhook(req.headers['x-webhook-secret'] as string | undefined)) {
      res.status(401).json({ error: 'Invalid webhook secret' });
      return;
    }

    const { type, data } = req.body as OnvoWebhookEvent;
    if (!type || !data) {
      res.status(400).json({ error: 'Malformed event' });
      return;
    }

    const order = await findOrderForEvent(data);
    if (!order) {
      console.warn(`ONVO webhook ${type}: no matching order`, { id: data.id });
      res.json({ received: true });
      return;
    }

    switch (type) {
      case 'payment-intent.succeeded': {
        // Re-verify against the API — the payload alone is not trusted
        let confirmed = false;
        try {
          const intent = await onvoPayService.getPaymentIntent(data.id as string);
          confirmed = intent.status === 'succeeded';
        } catch (e) {
          console.error('ONVO intent re-verify failed:', e);
        }
        if (confirmed) await markPaid(order.id, data.id, data);
        break;
      }
      case 'checkout-session.succeeded': {
        let confirmed = false;
        try {
          const session = await onvoPayService.getCheckoutSession(data.id as string);
          confirmed = session.paymentStatus === 'paid' || session.status === 'complete';
        } catch (e) {
          console.error('ONVO session re-verify failed:', e);
        }
        if (confirmed) await markPaid(order.id, data.paymentIntentId, data);
        break;
      }
      case 'payment-intent.failed':
        await markFailed(order.id, data.id, data);
        break;
      case 'payment-intent.deferred':
        // SINPE/bank transfer awaiting confirmation — leave PENDING, record event
        await prisma.payment.updateMany({
          where: { orderId: order.id },
          data: { tiloPayResponse: { deferred: true, event: data } as any },
        });
        break;
      default:
        // mobile-transfer.received, subscription events, etc. — log and ignore
        console.log(`ONVO webhook: unhandled event type ${type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('ONVO webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Manual/authenticated status check — refreshes PENDING payments via the ONVO
// API so admin (or a polling page) can reconcile orders whose webhook never
// arrived or fired while the site was down.
export const getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await prisma.payment.findFirst({
      where: { orderId: req.params.orderId as string },
      include: { order: { include: { items: true } } },
    });

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    if (payment.status === 'PENDING' && payment.order.status === 'PENDING') {
      try {
        const sessionId = (payment.tiloPayResponse as any)?.sessionId;
        if (sessionId) {
          const session = await onvoPayService.getCheckoutSession(sessionId);
          if (session.paymentStatus === 'paid' || session.status === 'complete') {
            await markPaid(payment.orderId, session.paymentIntentId, session);
            res.json({ ...payment, status: 'COMPLETED' });
            return;
          }
          if (session.status === 'expired') {
            await markFailed(payment.orderId, session.paymentIntentId, session);
            res.json({ ...payment, status: 'FAILED' });
            return;
          }
        }
      } catch {
        // ONVO unreachable — return cached status
      }
    }

    res.json(payment);
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
};
