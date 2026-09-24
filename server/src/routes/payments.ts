import { Router } from 'express';
import { handleWebhook, getPaymentStatus } from '../controllers/payments';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/webhook', handleWebhook);
router.get('/status/:orderId', authenticate, getPaymentStatus);

export default router;
