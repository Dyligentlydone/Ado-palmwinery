import { Router } from 'express';
import {
  createOrder, getMyOrders, getOrderById, createGuestOrder, getGuestOrder,
  adminGetOrders, adminUpdateOrder, adminGetAnalytics,
} from '../controllers/orders';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate, emailRegex } from '../middleware/validate';

const router = Router();

// Guest checkout (no account required)
router.post('/guest', validate({
  email: { required: true, pattern: emailRegex, message: 'Valid email is required' },
  firstName: { required: true, type: 'string', minLength: 1 },
  lastName: { required: true, type: 'string', minLength: 1 },
  street: { required: true, type: 'string', minLength: 1 },
  city: { required: true, type: 'string', minLength: 1 },
  postalCode: { required: true, type: 'string', minLength: 1 },
  country: { required: true, type: 'string', minLength: 2, maxLength: 2 },
  items: { required: true },
}), createGuestOrder);
router.get('/guest/:id', getGuestOrder);

// Customer routes
router.post('/', authenticate, createOrder);
router.get('/my', authenticate, getMyOrders);
router.get('/my/:id', authenticate, getOrderById);

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, adminGetOrders);
router.get('/admin/analytics', authenticate, requireAdmin, adminGetAnalytics);
router.put('/admin/:id', authenticate, requireAdmin, adminUpdateOrder);

export default router;
