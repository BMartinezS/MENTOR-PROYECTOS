import express from 'express';
import Joi from 'joi';

import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import * as WeeklyReviewController from '../controllers/weekly-review-controller.js';

const router = express.Router();

router.use(authenticate);

const saveAnswersSchema = Joi.object({
  answers: Joi.object()
    .pattern(Joi.string(), Joi.string().allow('').max(1000))
    .required(),
});

router.get('/projects/:projectId', WeeklyReviewController.getLatest);
router.post('/:id/answers', validateBody(saveAnswersSchema), WeeklyReviewController.saveAnswers);

export default router;
