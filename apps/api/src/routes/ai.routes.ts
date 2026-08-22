import { Router } from 'express';
import { chatWithCopilot } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/chat', chatWithCopilot);

export default router;
