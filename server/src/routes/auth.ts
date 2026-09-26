import { Router } from 'express';
import { register, login, getProfile, updateProfile, createAddress, updateAddress, deleteAddress, adminGetUsers } from '../controllers/auth';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate, emailRegex } from '../middleware/validate';

const router = Router();

router.post('/register', validate({
  email: { required: true, pattern: emailRegex, message: 'Valid email is required' },
  password: { required: true, type: 'string', minLength: 8, message: 'Password must be at least 8 characters' },
  firstName: { required: true, type: 'string', minLength: 1 },
  lastName: { required: true, type: 'string', minLength: 1 },
}), register);

router.post('/login', validate({
  email: { required: true, pattern: emailRegex, message: 'Valid email is required' },
  password: { required: true, type: 'string' },
}), login);

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
