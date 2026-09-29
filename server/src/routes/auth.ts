import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getProfile, updateProfile, createAddress, updateAddress, deleteAddress, adminGetUsers, changePassword, forgotPassword, resetPassword } from '../controllers/auth';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate, emailRegex } from '../middleware/validate';

const router = Router();

// Stricter rate limit on credential/reset endpoints to blunt brute-force attacks.
// Global /api/ limiter (300/15min) stays in place as a backstop.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts — please try again later.' },
});

router.post('/register', authLimiter, validate({
  email: { required: true, pattern: emailRegex, message: 'Valid email is required' },
  password: { required: true, type: 'string', minLength: 8, message: 'Password must be at least 8 characters' },
  firstName: { required: true, type: 'string', minLength: 1 },
  lastName: { required: true, type: 'string', minLength: 1 },
}), register);

router.post('/login', authLimiter, validate({
  email: { required: true, pattern: emailRegex, message: 'Valid email is required' },
  password: { required: true, type: 'string' },
}), login);

router.post('/forgot-password', authLimiter, validate({
  email: { required: true, pattern: emailRegex, message: 'Valid email is required' },
}), forgotPassword);

router.post('/reset-password', authLimiter, validate({
  token: { required: true, type: 'string', minLength: 32 },
  newPassword: { required: true, type: 'string', minLength: 8 },
}), resetPassword);

router.post('/change-password', authenticate, validate({
  currentPassword: { required: true, type: 'string' },
  newPassword: { required: true, type: 'string', minLength: 8 },
}), changePassword);

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

// Address management
router.post('/addresses', authenticate, validate({
  firstName: { required: true, type: 'string', minLength: 1 },
  lastName: { required: true, type: 'string', minLength: 1 },
  street: { required: true, type: 'string', minLength: 1 },
  city: { required: true, type: 'string', minLength: 1 },
  postalCode: { required: true, type: 'string', minLength: 1 },
  country: { required: true, type: 'string', minLength: 2, maxLength: 2 },
}), createAddress);
router.put('/addresses/:id', authenticate, updateAddress);
router.delete('/addresses/:id', authenticate, deleteAddress);

router.get('/admin/users', authenticate, requireAdmin, adminGetUsers);

export default router;
