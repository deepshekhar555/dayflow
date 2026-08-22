import { Router } from 'express';
import { applyLeave, getMyLeaves, getAllLeaves, approveLeave, rejectLeave, getLeaveTypes } from '../controllers/leave.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/types', getLeaveTypes);
router.post('/', applyLeave);
router.get('/me', getMyLeaves);

// HR/Admin only routes
router.get('/all', authorize(['HR', 'ADMIN']), getAllLeaves);
router.patch('/:id/approve', authorize(['HR', 'ADMIN']), approveLeave);
router.patch('/:id/reject', authorize(['HR', 'ADMIN']), rejectLeave);

export default router;
