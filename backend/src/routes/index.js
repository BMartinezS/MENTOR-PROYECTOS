import express from 'express';

import authRoutes from './auth.js';
import projectRoutes from './projects.js';
import taskRoutes from './tasks.js';
import checkinRoutes from './checkins.js';
import weeklyReviewRoutes from './weekly-reviews.js';
import planIterationRoutes from './plan-iterations.js';
import notificationRoutes from './notifications.js';
import webhookRoutes from './webhooks.js';
import subscriptionRoutes from './subscription.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/projects/:projectId/plan-iterations', planIterationRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/checkins', checkinRoutes);
router.use('/weekly-reviews', weeklyReviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/subscription', subscriptionRoutes);

export default router;
