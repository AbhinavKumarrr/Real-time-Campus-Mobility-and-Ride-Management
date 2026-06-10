import { Router } from 'express';
import {
  listAvailableDrivers,
  setAvailability,
  updateLocation,
} from '../controllers/driver.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/available', requireAuth, listAvailableDrivers);
router.patch('/availability', requireAuth, requireRole('driver'), setAvailability);
router.patch('/location', requireAuth, requireRole('driver'), updateLocation);

export default router;
