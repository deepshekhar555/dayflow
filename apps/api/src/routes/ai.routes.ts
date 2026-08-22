import { Router } from 'express';
import { chatWithCopilot, getInsights, nlSearch } from '../controllers/ai.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/chat', chatWithCopilot);

// HR Only AI Features
router.get('/insights', authorize(['HR', 'ADMIN']), getInsights);
router.post('/search', authorize(['HR', 'ADMIN']), nlSearch);

export default router;
