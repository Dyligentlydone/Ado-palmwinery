import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { onvoPayService } from '../services/onvopay';
import { shippingService } from '../services/shipping';
import { reconcileOrderPayment } from './payments';
import { SupportedCurrency } from '../config/constants';

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ADO-${timestamp}-${random}`;
}

// ONVO supports USD and CRC on CR accounts — orders in any other currency are
// charged in USD (the checkout page shows the customer USD prices in that case).
function chargeCurrency(currency: string): 'USD' | 'CRC' {
  return currency === 'CRC' ? 'CRC' : 'USD';
}

// Creates an ONVO hosted-checkout session. The customer's browser returns to the
// confirmation page on success; the real confirmation arrives via the signed
// webhook (/api/payments/webhook) — the redirect itself changes nothing.
async function initiateOnvoPayment(order: any, currency: string, customerEmail: string) {
  try {
    if (!onvoPayService.isConfigured()) {
      console.warn('ONVO Pay credentials not configured — order created without payment link');
      return null;
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const addr = order.address;
    const onvoCurrency = chargeCurrency(currency);
    const toMinor = (n: any) => Math.round(Number(n) * 100);

    const lineItems = order.items.map((item: any) => ({
      quantity: item.quantity,
      unitAmount: toMinor(item.unitPrice),
      currency: onvoCurrency,
      description: item.productName,
      priceType: 'one_time' as const,
    }));
    if (Number(order.shippingCost) > 0) {
      lineItems.push({
        quantity: 1,
        unitAmount: toMinor(order.shippingCost),
        currency: onvoCurrency,
        description: `Shipping - ${addr?.country || ''}`,
        priceType: 'one_time' as const,
      });
    }

    const session = await onvoPayService.createCheckoutSession({
      customerName: `${addr?.firstName || ''} ${addr?.lastName || ''}`.trim() || 'Customer',
      customerEmail,
      customerPhone: addr?.phone || undefined,
      redirectUrl: `${clientUrl}/order-confirmation/${order.id}`,
      cancelUrl: `${clientUrl}/checkout`,
      captureMethod: 'automatic',
      paymentMethodTypes: ['card', 'mobile_number', 'zunify', 'bank_deposit'],
      lineItems,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        currency: currency as any,
        status: 'PENDING',
        tiloPayResponse: { sessionId: session.id, url: session.url } as any,
      },
    });

    return { paymentUrl: session.url };
  } catch (paymentError) {
    console.error('Payment initiation error:', paymentError);
    // Order is created but payment failed - admin can handle manually
    return null;
  }
}

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { addressId, notes } = req.body;
    // Orders are stored in the currency we actually charge — ONVO takes USD/CRC only
    const currency = req.body.currency === 'CRC' ? 'CRC' : 'USD';
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
    const priceField = `price${currency}` as 'priceUSD' | 'priceEUR' | 'priceGBP' | 'priceCRC';
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

    // Create order, decrement stock, and clear cart atomically
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
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

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    // Initiate payment with ONVO Pay
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const paymentData = await initiateOnvoPayment(order, currency, user!.email);

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
    // Opportunistically reconcile a PENDING order with ONVO before we return —
    // heals stale orders on the OrderConfirmation page without needing the webhook.
    await reconcileOrderPayment(req.params.id as string);

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

// --- GUEST CHECKOUT (no account required) ---

export const createGuestOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email, firstName, lastName, phone,
      street, city, state, postalCode, country,
      items, notes,
    } = req.body;
    // Orders are stored in the currency we actually charge — ONVO takes USD/CRC only
    const currency = req.body.currency === 'CRC' ? 'CRC' : 'USD';

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    // Load products and validate stock — prices always come from the DB, never the client
    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });
    const productMap = new Map(products.map(p => [p.id, p]));

    const priceField = `price${currency}` as 'priceUSD' | 'priceEUR' | 'priceGBP' | 'priceCRC';
    let subtotal = 0;
    let totalWeight = 0;
    const lineItems: { product: (typeof products)[number]; quantity: number; price: number }[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 0));
      if (!product) {
        res.status(400).json({ error: 'A product in your cart is no longer available' });
        return;
      }
      if (quantity > product.stock) {
        res.status(400).json({ error: `Insufficient stock for ${product.name}` });
        return;
      }
      const price = Number(product[priceField] || product.priceUSD);
      subtotal += price * quantity;
      totalWeight += Number(product.weight || 0) * quantity;
      lineItems.push({ product, quantity, price });
    }

    const shipping = await shippingService.calculateShipping(
      country,
      totalWeight,
      currency as SupportedCurrency
    );
    const shippingCost = shipping?.cost || 0;
    const total = subtotal + shippingCost;

    // Create address, order, and decrement stock atomically
    const order = await prisma.$transaction(async (tx) => {
      const address = await tx.address.create({
        data: { firstName, lastName, street, city, state, postalCode, country, phone: phone || null },
      });

      const created = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          guestEmail: email,
          guestName: `${firstName} ${lastName}`,
          addressId: address.id,
          status: 'PENDING',
          currency: currency as any,
          subtotal,
          shippingCost,
          tax: 0,
          total,
          notes,
          items: {
            create: lineItems.map(({ product, quantity, price }) => ({
              productId: product.id,
              productName: product.name,
              quantity,
              unitPrice: price,
              totalPrice: price * quantity,
            })),
          },
        },
        include: { items: true, address: true },
      });

      for (const { product, quantity } of lineItems) {
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: quantity } },
        });
      }

      return created;
    });

    const paymentData = await initiateOnvoPayment(order, currency, email);

    res.status(201).json({ order, payment: paymentData });
  } catch (error) {
    console.error('Create guest order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const getGuestOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    // Same opportunistic reconciliation — critical for guests who can't otherwise
    // trigger it. UUID is their bearer, they polled the endpoint themselves.
    await reconcileOrderPayment(req.params.id as string);

    // ID is an unguessable UUID — acts as the order's secret link for guests
    const order = await prisma.order.findUnique({
      where: { id: req.params.id as string },
      select: {
        id: true, orderNumber: true, status: true, currency: true, userId: true,
        subtotal: true, shippingCost: true, tax: true, total: true,
        createdAt: true,
        items: { select: { id: true, productName: true, quantity: true, unitPrice: true, totalPrice: true } },
      },
    });

    if (!order || order.userId) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Get guest order error:', error);
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
    const orderWhere = { createdAt: { gte: dateFrom }, status: { not: 'CANCELLED' as const } };

    const [orders, orderItems] = await Promise.all([
      prisma.order.findMany({
        where: orderWhere,
        select: { total: true, status: true, createdAt: true, currency: true },
      }),
      prisma.orderItem.findMany({
        where: { order: orderWhere },
        select: {
          productId: true,
          productName: true,
          quantity: true,
          totalPrice: true,
          order: { select: { currency: true } },
        },
      }),
    ]);

    const totalOrders = orders.length;
    const totalUnitsSold = orderItems.reduce((sum, i) => sum + i.quantity, 0);

    // Revenue is never summed across currencies — each currency gets its own totals
    const currencyMap: Record<string, { revenue: number; orders: number }> = {};
    const ordersByStatus: Record<string, number> = {};
    const dayMap: Record<string, { orders: number; byCurrency: Record<string, number> }> = {};

    orders.forEach(o => {
      const cur = o.currency || 'USD';
      (currencyMap[cur] ||= { revenue: 0, orders: 0 });
      currencyMap[cur].revenue += Number(o.total);
      currencyMap[cur].orders += 1;
      ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
      const day = o.createdAt.toISOString().split('T')[0];
      (dayMap[day] ||= { orders: 0, byCurrency: {} });
      dayMap[day].orders += 1;
      dayMap[day].byCurrency[cur] = (dayMap[day].byCurrency[cur] || 0) + Number(o.total);
    });

    const byCurrency = Object.entries(currencyMap)
      .map(([currency, d]) => ({
        currency,
        revenue: Math.round(d.revenue * 100) / 100,
        orders: d.orders,
        averageOrderValue: d.orders > 0 ? Math.round((d.revenue / d.orders) * 100) / 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
    const currencies = byCurrency.map(c => c.currency);

    // Top products, grouped per product + currency
    const prodMap: Record<string, { productId: string; productName: string; totalSold: number; revenue: number; currency: string }> = {};
    orderItems.forEach(i => {
      const cur = i.order.currency || 'USD';
      const key = `${i.productId}:${cur}`;
      (prodMap[key] ||= { productId: i.productId, productName: i.productName, totalSold: 0, revenue: 0, currency: cur });
      prodMap[key].totalSold += i.quantity;
      prodMap[key].revenue += Number(i.totalPrice);
    });
    const topProducts = Object.values(prodMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(p => ({ ...p, revenue: Math.round(p.revenue * 100) / 100 }));

    const revenueByDay = Object.entries(dayMap)
      .map(([date, d]) => ({
        date,
        orders: d.orders,
        ...Object.fromEntries(currencies.map(c => [c, Math.round((d.byCurrency[c] || 0) * 100) / 100])),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      totalOrders,
      totalUnitsSold,
      currencies,
      byCurrency,
      topProducts,
      ordersByStatus,
      revenueByDay,
    });
  } catch (error) {
    console.error('Admin get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
