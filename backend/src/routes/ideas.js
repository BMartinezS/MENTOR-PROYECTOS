import express from 'express';
import Joi from 'joi';

import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import * as IdeaController from '../controllers/idea-controller.js';

const router = express.Router();

router.use(authenticate);

const createSchema = Joi.object({
  title: Joi.string().max(200).required(),
  description: Joi.string().allow('', null).optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(10).default([]),
  priority: Joi.number().integer().min(0).default(0),
});

const updateSchema = Joi.object({
  title: Joi.string().max(200).optional(),
  description: Joi.string().allow('', null).optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
  priority: Joi.number().integer().min(0).optional(),
}).min(1);

// GET /ideas - List all ideas with optional filters
router.get('/', IdeaController.getAll);

// POST /ideas - Create a new idea
router.post('/', validateBody(createSchema), IdeaController.create);

// GET /ideas/:id - Get a single idea
router.get('/:id', IdeaController.getById);

// PUT /ideas/:id - Update an idea
router.put('/:id', validateBody(updateSchema), IdeaController.update);

// DELETE /ideas/:id - Delete an idea
router.delete('/:id', IdeaController.destroy);

// POST /ideas/:id/archive - Archive an idea
router.post('/:id/archive', IdeaController.archive);

// POST /ideas/:id/unarchive - Unarchive an idea (restore to active)
router.post('/:id/unarchive', IdeaController.unarchive);

// POST /ideas/:id/promote - Promote idea to project
router.post('/:id/promote', IdeaController.promoteToProject);

export default router;
