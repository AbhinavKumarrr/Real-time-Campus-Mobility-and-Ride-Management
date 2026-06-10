import { Router } from 'express';
import authRoutes from './auth.routes.js';
import driverRoutes from './driver.routes.js';
import rideRoutes from './ride.routes.js';
import ratingRoutes from './rating.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

router.use('/auth', authRoutes);
router.use('/drivers', driverRoutes);
router.use('/rides', rideRoutes);
router.use('/ratings', ratingRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
