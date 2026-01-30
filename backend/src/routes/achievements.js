import express from 'express';

import { authenticate } from '../middleware/auth.js';
import * as AchievementsController from '../controllers/achievements-controller.js';

const router = express.Router();

// GET /achievements - All available achievements (public info)
router.get('/', AchievementsController.getAll);

// Protected routes
router.use(authenticate);

// GET /achievements/me - My unlocked achievements
router.get('/me', AchievementsController.getMine);

// POST /achievements/check - Manually trigger achievement check (useful for debugging)
router.post('/check', AchievementsController.checkAndUnlock);

export default router;
