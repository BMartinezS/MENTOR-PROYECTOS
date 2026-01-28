import express from 'express';
import Joi from 'joi';

import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { requireProTier } from '../middleware/require-pro.js';
import * as ProjectsController from '../controllers/projects-controller.js';
import * as PhaseController from '../controllers/phase-controller.js';

const router = express.Router();

const AREA_VALUES = ['marketing', 'product', 'operations', 'general'];
const PLAN_FORMAT_VALUES = ['lean', 'standard', 'detailed'];

router.use(authenticate);

const createSchema = Joi.object({
  title: Joi.string().max(200).required(),
  description: Joi.string().allow('').optional(),
  targetDate: Joi.date().iso().optional(),
  area: Joi.string().valid(...AREA_VALUES).default('general'),
  planFormat: Joi.string().valid(...PLAN_FORMAT_VALUES).default('standard'),
});

const updateSchema = Joi.object({
  title: Joi.string().max(200).optional(),
  description: Joi.string().allow('').optional(),
  status: Joi.string().valid('active', 'paused', 'completed', 'cancelled').optional(),
  progress: Joi.number().integer().min(0).max(100).optional(),
  targetDate: Joi.date().iso().optional(),
  area: Joi.string().valid(...AREA_VALUES).optional(),
  planFormat: Joi.string().valid(...PLAN_FORMAT_VALUES).optional(),
});

const aiPlanSchema = Joi.object({
  idea: Joi.string().min(5).required(),
  availableHoursPerWeek: Joi.number().min(1).max(100).required(),
  targetDate: Joi.date().iso().required(),
  area: Joi.string().valid(...AREA_VALUES).default('general'),
  planFormat: Joi.string().valid(...PLAN_FORMAT_VALUES).default('standard'),
});

const phaseUpdateSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  description: Joi.string().allow('').optional(),
}).min(1);

const reorderPhaseSchema = Joi.object({
  id: Joi.string().uuid().optional(),
  name: Joi.when('id', { is: Joi.exist(), then: Joi.string().max(100).optional(), otherwise: Joi.string().max(100).required() }),
  description: Joi.string().allow('').optional(),
});

const phaseReorderSchema = Joi.object({
  phases: Joi.array().items(reorderPhaseSchema).min(1).required(),
});

router.post('/', validateBody(createSchema), ProjectsController.create);
router.post('/ai-plan', validateBody(aiPlanSchema), ProjectsController.createAiPlan);
router.get('/', ProjectsController.getAll);
router.get('/:id', ProjectsController.getById);
router.patch('/:id', validateBody(updateSchema), ProjectsController.update);
router.delete('/:id', ProjectsController.destroy);
router.patch('/:id/phases/:phaseId', requireProTier, validateBody(phaseUpdateSchema), PhaseController.update);
router.post('/:id/phases/reorder', requireProTier, validateBody(phaseReorderSchema), PhaseController.reorder);

export default router;

