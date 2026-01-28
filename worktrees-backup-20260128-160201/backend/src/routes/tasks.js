import express from 'express';
import Joi from 'joi';

import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { requireProTier } from '../middleware/require-pro.js';
import * as TasksController from '../controllers/tasks-controller.js';

const router = express.Router();

router.use(authenticate);

const completeSchema = Joi.object({
  notes: Joi.string().allow('').optional(),
  evidenceUrl: Joi.string().uri().optional(),
});

const metricSchema = Joi.object({
  name: Joi.string().max(100).required(),
  target: Joi.string().allow('', null).max(200).optional(),
  unit: Joi.string().allow('', null).max(50).optional(),
});

const updateSchema = Joi.object({
  title: Joi.string().max(200).optional(),
  description: Joi.string().allow('').optional(),
  notes: Joi.string().allow('').optional(),
  responsible: Joi.string().max(100).allow('', null).optional(),
  dueDate: Joi.date().iso().allow(null).optional(),
  phaseId: Joi.string().uuid().allow(null).optional(),
  estimatedHours: Joi.number().min(0).max(1000).optional(),
  deliverables: Joi.array().items(Joi.string().max(200)).optional(),
  dependencies: Joi.array().items(Joi.string().max(200)).optional(),
  metrics: Joi.array().items(metricSchema).optional(),
}).min(1);

router.get('/:id', TasksController.getDetails);
router.patch('/:id', requireProTier, validateBody(updateSchema), TasksController.update);
router.patch('/:id/complete', validateBody(completeSchema), TasksController.complete);

export default router;

