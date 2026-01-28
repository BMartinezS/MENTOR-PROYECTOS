import { Router } from 'express';
import {
  generateCheckin,
  generatePlan,
  generatePlanIteration,
  generateWeeklyReview,
  suggestTaskSplit,
  testAI,
} from '../controllers/ai-controller.js';
import { applyRateLimit } from '../middleware/rate-limit.js';

export const aiRouter = Router();

aiRouter.use(applyRateLimit());

aiRouter.post('/test', (req, res, next) => {
  testAI(req, res).catch(next);
});

aiRouter.post('/generate-plan', (req, res, next) => {
  generatePlan(req, res).catch(next);
});

aiRouter.post('/plans/:projectId/iterations', (req, res, next) => {
  generatePlanIteration(req, res).catch(next);
});

aiRouter.post('/generate-checkin', (req, res, next) => {
  generateCheckin(req, res).catch(next);
});

aiRouter.post('/weekly-review', (req, res, next) => {
  generateWeeklyReview(req, res).catch(next);
});

aiRouter.post('/suggest-task-split', (req, res, next) => {
  suggestTaskSplit(req, res).catch(next);
});
