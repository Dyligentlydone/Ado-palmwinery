import { Router } from 'express';
import {
  createOrder, getMyOrders, getOrderById,
  adminGetOrders, adminUpdateOrder, adminGetAnalytics,
} from '../controllers/orders';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Customer routes
router.post('/', authenticate, createOrder);
router.get('/my', authenticate, getMyOrders);
router.get('/my/:id', authenticate, getOrderById);

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, adminGetOrders);
router.get('/admin/analytics', authenticate, requireAdmin, adminGetAnalytics);
router.put('/admin/:id', authenticate, requireAdmin, adminUpdateOrder);

export default router;
