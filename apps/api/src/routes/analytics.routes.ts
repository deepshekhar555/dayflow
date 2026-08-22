import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize(['HR', 'ADMIN']));

router.get('/dashboard', getDashboardAnalytics);

export default router;
