import { Request, Response } from 'express';
import prisma from '../config/database';
import { tiloPayService } from '../services/tilopay';

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-tilopay-signature'] as string;
    const rawBody = JSON.stringify(req.body);

    // Verify webhook signature
    if (signature && !tiloPayService.verifyWebhookSignature(rawBody, signature)) {
      res.status(400).json({ error: 'Invalid webhook signature' });
      return;
    }

    const { id: tiloPaymentId, status, amount } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { tiloPaymentId },
      include: { order: true },
    });

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    // Map Tilo Pay status to our status
    let paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' = 'PENDING';
    let orderStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' = 'PENDING';

    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
      case 'success':
        paymentStatus = 'COMPLETED';
        orderStatus = 'CONFIRMED';
        break;
      case 'failed':
      case 'declined':
      case 'error':
        paymentStatus = 'FAILED';
        orderStatus = 'CANCELLED';
        break;
      case 'refunded':
        paymentStatus = 'REFUNDED';
        break;
    }

    // Update payment and order
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: paymentStatus,
          tiloPayResponse: req.body,
        },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: { status: orderStatus },
      }),
    ]);

    // If payment failed, restore stock
    if (paymentStatus === 'FAILED') {
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: payment.orderId },
      });
      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

export const getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await prisma.payment.findFirst({
      where: { orderId: req.params.orderId as string },
    });

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    // Optionally refresh status from Tilo Pay
    if (payment.tiloPaymentId && payment.status === 'PENDING') {
      try {
        const tiloStatus = await tiloPayService.getPayment(payment.tiloPaymentId);
        if (tiloStatus.status !== 'pending') {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { tiloPayResponse: tiloStatus as any },
          });
        }
      } catch {
        // If we can't reach Tilo Pay, return cached status
      }
    }

    res.json(payment);
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
};
