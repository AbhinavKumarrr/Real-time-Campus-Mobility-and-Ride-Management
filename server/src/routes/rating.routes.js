import { Router } from 'express';
import { createRating, getDriverRatings } from '../controllers/rating.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, requireRole('passenger'), createRating);
router.get('/driver/:id', requireAuth, getDriverRatings);

export default router;
