import { Router } from 'express';
import { getMyProfile, updateMyProfile } from '../controllers/employee.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);

export default router;
