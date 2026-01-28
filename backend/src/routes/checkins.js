import express from 'express';
import Joi from 'joi';

import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import * as CheckinsController from '../controllers/checkins-controller.js';

const router = express.Router();

router.use(authenticate);

const respondSchema = Joi.object({
  completed: Joi.boolean().required(),
  notes: Joi.string().allow('').optional(),
  blockedReason: Joi.string().allow('', null).optional(),
  nextSteps: Joi.string().allow('', null).optional(),
});

router.get('/pending', CheckinsController.getPending);
router.post('/:id/respond', validateBody(respondSchema), CheckinsController.respond);

export default router;

