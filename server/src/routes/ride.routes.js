import { Router } from 'express';
import {
  requestRide,
  listMyRides,
  listOpenRequests,
  getRide,
  acceptRide,
  rejectRide,
  startRide,
  completeRide,
  cancelRide,
} from '../controllers/ride.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('passenger'), requestRide);
router.get('/', listMyRides);
router.get('/requests', requireRole('driver'), listOpenRequests);
router.get('/:id', getRide);

router.patch('/:id/accept', requireRole('driver'), acceptRide);
router.patch('/:id/reject', requireRole('driver'), rejectRide);
router.patch('/:id/start', requireRole('driver'), startRide);
router.patch('/:id/complete', requireRole('driver'), completeRide);
router.patch('/:id/cancel', cancelRide);

export default router;
