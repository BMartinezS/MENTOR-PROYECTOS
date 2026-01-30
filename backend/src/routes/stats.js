import express from 'express';

import { authenticate } from '../middleware/auth.js';
import * as StatsController from '../controllers/stats-controller.js';

const router = express.Router();

router.use(authenticate);

// GET /api/stats/me - Get current user's stats
router.get('/me', StatsController.getMyStats);

// GET /api/stats/leaderboard - Get top users by XP
router.get('/leaderboard', StatsController.getLeaderboard);

export default router;
