import { Router } from 'express';
import {
  calculateShipping, getShippingZones,
  adminCreateShippingZone, adminUpdateShippingZone, adminDeleteShippingZone,
} from '../controllers/shipping';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/calculate', calculateShipping);
router.get('/zones', getShippingZones);

// Admin routes
router.post('/zones', authenticate, requireAdmin, adminCreateShippingZone);
router.put('/zones/:id', authenticate, requireAdmin, adminUpdateShippingZone);
router.delete('/zones/:id', authenticate, requireAdmin, adminDeleteShippingZone);

export default router;
