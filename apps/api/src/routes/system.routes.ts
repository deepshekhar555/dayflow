import { Router } from 'express';
import { getAuditLogs, exportAttendanceReport } from '../controllers/system.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize(['HR', 'ADMIN']));

router.get('/audit-logs', getAuditLogs);
router.get('/reports/attendance', exportAttendanceReport);

export default router;
