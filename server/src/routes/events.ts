import { Router } from 'express';
import {
  listEvents, getEventBySlug,
  adminListEvents, adminCreateEvent, adminUpdateEvent, adminDeleteEvent,
} from '../controllers/events';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Public
router.get('/', listEvents);
router.get('/admin/all', authenticate, requireAdmin, adminListEvents);
router.get('/:slug', getEventBySlug);

// Admin CRUD
router.post('/admin', authenticate, requireAdmin, adminCreateEvent);
router.put('/admin/:id', authenticate, requireAdmin, adminUpdateEvent);
router.delete('/admin/:id', authenticate, requireAdmin, adminDeleteEvent);

export default router;
