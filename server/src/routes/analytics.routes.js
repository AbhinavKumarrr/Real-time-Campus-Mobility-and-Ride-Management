import { Router } from 'express';
import { driverDashboard, demandAnalytics } from '../controllers/analytics.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/driver', requireAuth, requireRole('driver'), driverDashboard);
router.get('/demand', requireAuth, demandAnalytics);

export default router;
