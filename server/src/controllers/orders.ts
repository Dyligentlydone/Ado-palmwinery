import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { tiloPayService } from '../services/tilopay';
import { shippingService } from '../services/shipping';
import { SupportedCurrency } from '../config/constants';

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ADO-${timestamp}-${random}`;
}

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { addressId, currency = 'USD', notes } = req.body;
    const userId = req.user!.id;

    // Get cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    // Verify address
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    // Verify stock and calculate subtotal
    const priceField = `price${currency}` as 'priceUSD' | 'priceEUR' | 'priceGBP';
    let subtotal = 0;
    let totalWeight = 0;

    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        res.status(400).json({ error: `Insufficient stock for ${item.product.name}` });
        return;
      }
      const price = Number(item.product[priceField] || item.product.priceUSD);
      subtotal += price * item.quantity;
      totalWeight += Number(item.product.weight || 0) * item.quantity;
    }

    // Calculate shipping
    const shipping = await shippingService.calculateShipping(
      address.country,
      totalWeight,
      currency as SupportedCurrency
    );
    const shippingCost = shipping?.cost || 0;
    const total = subtotal + shippingCost;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        addressId,
        status: 'PENDING',
        currency: currency as any,
        subtotal,
        shippingCost,
        tax: 0,
        total,
        notes,
        items: {
          create: cart.items.map(item => {
            const price = Number(item.product[priceField] || item.product.priceUSD);
            return {
              productId: item.product.id,
              productName: item.product.name,
              quantity: item.quantity,
              unitPrice: price,
              totalPrice: price * item.quantity,
            };
          }),
        },
      },
      include: { items: true, address: true },
    });

    // Decrement stock
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    // Initiate payment with Tilo Pay
    const user = await prisma.user.findUnique({ where: { id: userId } });
    let paymentData = null;

    try {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const serverUrl = `http://localhost:${process.env.PORT || 5000}`;

      const tiloResponse = await tiloPayService.createPayment({
        amount: total,
        currency,
        description: `ADO Palmwinery Order ${order.orderNumber}`,
        orderId: order.id,
        customerEmail: user!.email,
        customerName: `${user!.firstName} ${user!.lastName}`,
        redirectUrl: `${clientUrl}/order-confirmation/${order.id}`,
        callbackUrl: `${serverUrl}/api/payments/webhook`,
      });

      await prisma.payment.create({
        data: {
          orderId: order.id,
          tiloPaymentId: tiloResponse.id,
          amount: total,
          currency: currency as any,
          status: 'PENDING',
          tiloPayResponse: tiloResponse as any,
        },
      });

      paymentData = { paymentUrl: tiloResponse.paymentUrl, paymentId: tiloResponse.id };
    } catch (paymentError) {
      console.error('Payment initiation error:', paymentError);
      // Order is created but payment failed - admin can handle manually
    }

    res.status(201).json({ order, payment: paymentData });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user!.id },
        include: { items: true, payment: true, address: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: { userId: req.user!.id } }),
    ]);

    res.json({ orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id as string, userId: req.user!.id },
      include: { items: { include: { product: true } }, payment: true, address: true },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// --- ADMIN ENDPOINTS ---

export const adminGetOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.dateFrom || req.query.dateTo) {
      where.createdAt = {};
      if (req.query.dateFrom) where.createdAt.gte = new Date(req.query.dateFrom as string);
      if (req.query.dateTo) where.createdAt.lte = new Date(req.query.dateTo as string);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true, payment: true, user: { select: { id: true, email: true, firstName: true, lastName: true } }, address: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const adminUpdateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, trackingNumber, shippingCarrier } = req.body;

    const order = await prisma.order.update({
      where: { id: req.params.id as string },
      data: { status, trackingNumber, shippingCarrier },
      include: { items: true, payment: true, user: { select: { id: true, email: true, firstName: true, lastName: true } }, address: true },
    });

    res.json(order);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    console.error('Admin update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

export const adminGetAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const daysBack = parseInt(req.query.days as string) || 30;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - daysBack);

    const [orders, topProducts] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: dateFrom }, status: { not: 'CANCELLED' } },
        select: { total: true, status: true, createdAt: true },
      }),
      prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        _sum: { quantity: true, totalPrice: true },
        where: { order: { createdAt: { gte: dateFrom }, status: { not: 'CANCELLED' } } },
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 10,
      }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const ordersByStatus: Record<string, number> = {};
    const revenueByDayMap: Record<string, { revenue: number; orders: number }> = {};
    orders.forEach(o => {
      ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
      const day = o.createdAt.toISOString().split('T')[0];
      if (!revenueByDayMap[day]) revenueByDayMap[day] = { revenue: 0, orders: 0 };
      revenueByDayMap[day].revenue += Number(o.total);
      revenueByDayMap[day].orders += 1;
    });

    const revenueByDay = Object.entries(revenueByDayMap)
      .map(([date, data]) => ({ date, revenue: Math.round(data.revenue * 100) / 100, orders: data.orders }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      topProducts: topProducts.map(p => ({
        productId: p.productId,
        productName: p.productName,
        totalSold: p._sum.quantity || 0,
        revenue: Number(p._sum.totalPrice || 0),
      })),
      ordersByStatus,
      revenueByDay,
    });
  } catch (error) {
    console.error('Admin get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
