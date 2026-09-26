import { Router } from 'express';
import { handleOnvoWebhook, getPaymentStatus } from '../controllers/payments';
import { authenticate } from '../middleware/auth';

const router = Router();

// ONVO webhook — server-to-server payment confirmations (secret-verified)
router.post('/webhook', handleOnvoWebhook);

router.get('/status/:orderId', authenticate, getPaymentStatus);

export default router;
