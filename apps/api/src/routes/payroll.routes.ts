import { Router } from 'express';
import { generatePayslip, getMyPayslips } from '../controllers/payroll.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/me', getMyPayslips);
router.post('/generate', authorize(['HR', 'ADMIN']), generatePayslip);

export default router;
