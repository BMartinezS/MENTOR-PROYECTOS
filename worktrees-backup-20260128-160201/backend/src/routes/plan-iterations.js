import express from 'express';
import Joi from 'joi';

import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import * as PlanIterationController from '../controllers/plan-iteration-controller.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

const createSchema = Joi.object({
  feedback: Joi.string().min(5).max(2000).required(),
  focusArea: Joi.string().max(100).allow('', null).optional(),
});

router.get('/', PlanIterationController.list);
router.post('/', validateBody(createSchema), PlanIterationController.create);

export default router;
