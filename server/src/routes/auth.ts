import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/auth';
import { authenticate } from '../middleware/auth';
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

export default router;
