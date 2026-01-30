import express from 'express';

import { getSubscriptionStatus } from '../controllers/subscription-controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All subscription routes require authentication
router.use(authenticate);

router.get('/status', getSubscriptionStatus);

export default router;
