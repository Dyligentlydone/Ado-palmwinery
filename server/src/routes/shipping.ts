import { Router } from 'express';
import {
  calculateShipping, getShippingZones,
  adminCreateShippingZone, adminUpdateShippingZone,
} from '../controllers/shipping';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/calculate', calculateShipping);
router.get('/zones', getShippingZones);

// Admin routes
router.post('/zones', authenticate, requireAdmin, adminCreateShippingZone);
router.put('/zones/:id', authenticate, requireAdmin, adminUpdateShippingZone);

export default router;
