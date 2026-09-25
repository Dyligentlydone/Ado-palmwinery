import { Router } from 'express';
import {
  submitContact, adminGetMessages, adminMarkMessageRead, adminDeleteMessage,
} from '../controllers/contact';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate, emailRegex } from '../middleware/validate';

const router = Router();

router.post('/', validate({
  name: { required: true, type: 'string', minLength: 1 },
  email: { required: true, pattern: emailRegex, message: 'Valid email is required' },
  subject: { type: 'string' },
  message: { required: true, type: 'string', minLength: 1 },
}), submitContact);

router.get('/admin', authenticate, requireAdmin, adminGetMessages);
router.put('/admin/:id', authenticate, requireAdmin, adminMarkMessageRead);
router.delete('/admin/:id', authenticate, requireAdmin, adminDeleteMessage);

export default router;
