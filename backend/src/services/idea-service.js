import { Op } from 'sequelize';

import sequelize from '../config/database.js';
import { AppError } from '../errors/app-error.js';
import { Idea, Project } from '../models/index.js';

// Limits for free tier
const FREE_IDEAS_LIMIT = 5;

/**
 * Check idea limit for free users
 */
async function enforceIdeaLimit(userId, userTier) {
  if (userTier === 'pro') return;

  const count = await Idea.count({
    where: {
      userId,
      status: { [Op.ne]: 'archived' },
    },
  });

  if (count >= FREE_IDEAS_LIMIT) {
    throw new AppError(`Free plan permite hasta ${FREE_IDEAS_LIMIT} ideas activas`, {
      statusCode: 403,
      code: 'free_idea_limit',
      details: {
        currentCount: count,
        limit: FREE_IDEAS_LIMIT,
      },
    });
  }
}

/**
 * Create a new idea
 * @param {Object} user - User object with id and tier
 * @param {Object} data - Idea data
 * @param {string} data.title - Idea title (required)
 * @param {string} [data.description] - Idea description
 * @param {string[]} [data.tags] - Array of tags
 * @param {number} [data.priority] - Priority order
 * @returns {Promise<Idea>}
 */
export async function create(user, { title, description, tags, priority }) {
  await enforceIdeaLimit(user.id, user.tier);

  return Idea.create({
    userId: user.id,
    title,
    description: description || null,
    tags: tags || [],
    priority: priority || 0,
    status: 'active',
  });
}

/**
 * Get all ideas for a user with optional filters
 * @param {string} userId - User ID
 * @param {Object} [filters] - Filter options
 * @param {string} [filters.status] - Filter by status
 * @param {string[]} [filters.tags] - Filter by tags (any match)
 * @param {number} [filters.limit] - Max number of results (default 50)
 * @param {number} [filters.offset] - Offset for pagination
 * @returns {Promise<{ideas: Idea[], total: number}>}
 */
export async function getAll(userId, filters = {}) {
  const { status, tags, limit = 50, offset = 0 } = filters;

  const where = { userId };

  if (status) {
    where.status = status;
  }

  if (tags && tags.length > 0) {
    where.tags = { [Op.overlap]: tags };
  }

  const { count, rows } = await Idea.findAndCountAll({
    where,
    order: [
      ['priority', 'DESC'],
      ['createdAt', 'DESC'],
    ],
    limit: Math.min(limit, 50),
    offset,
  });

  return {
    ideas: rows.map((idea) => ({
      id: idea.id,
      title: idea.title,
      description: idea.description,
      tags: idea.tags,
      status: idea.status,
      priority: idea.priority,
      promotedToProjectId: idea.promotedToProjectId,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt,
    })),
    total: count,
  };
}

/**
 * Get a single idea by ID
 * @param {string} userId - User ID
 * @param {string} ideaId - Idea ID
 * @returns {Promise<Idea>}
 */
export async function getById(userId, ideaId) {
  const idea = await Idea.findOne({
    where: { id: ideaId, userId },
    include: [
      {
        model: Project,
        as: 'promotedToProject',
        attributes: ['id', 'title', 'status'],
        required: false,
      },
    ],
  });

  if (!idea) {
    throw new AppError('Idea not found', { statusCode: 404, code: 'not_found' });
  }

  return {
    id: idea.id,
    title: idea.title,
    description: idea.description,
    tags: idea.tags,
    status: idea.status,
    priority: idea.priority,
    promotedToProjectId: idea.promotedToProjectId,
    promotedToProject: idea.promotedToProject
      ? {
          id: idea.promotedToProject.id,
          title: idea.promotedToProject.title,
          status: idea.promotedToProject.status,
        }
      : null,
    createdAt: idea.createdAt,
    updatedAt: idea.updatedAt,
  };
}

/**
 * Update an idea
 * @param {string} userId - User ID
 * @param {string} ideaId - Idea ID
 * @param {Object} data - Updated data
 * @returns {Promise<Idea>}
 */
export async function update(userId, ideaId, data) {
  const idea = await Idea.findOne({ where: { id: ideaId, userId } });

  if (!idea) {
    throw new AppError('Idea not found', { statusCode: 404, code: 'not_found' });
  }

  if (idea.status === 'promoted') {
    throw new AppError('Cannot update promoted idea', {
      statusCode: 400,
      code: 'idea_promoted',
    });
  }

  const allowedFields = ['title', 'description', 'tags', 'priority'];
  const updates = {};

  for (const field of allowedFields) {
    if (field in data) {
      updates[field] = data[field];
    }
  }

  await idea.update(updates);

  return {
    id: idea.id,
    title: idea.title,
    description: idea.description,
    tags: idea.tags,
    status: idea.status,
    priority: idea.priority,
    promotedToProjectId: idea.promotedToProjectId,
    createdAt: idea.createdAt,
    updatedAt: idea.updatedAt,
  };
}

/**
 * Delete an idea
 * @param {string} userId - User ID
 * @param {string} ideaId - Idea ID
 */
export async function destroy(userId, ideaId) {
  const idea = await Idea.findOne({ where: { id: ideaId, userId } });

  if (!idea) {
    throw new AppError('Idea not found', { statusCode: 404, code: 'not_found' });
  }

  if (idea.status === 'promoted') {
    throw new AppError('Cannot delete promoted idea', {
      statusCode: 400,
      code: 'idea_promoted',
    });
  }

  await idea.destroy();
}

/**
 * Archive an idea
 * @param {string} userId - User ID
 * @param {string} ideaId - Idea ID
 * @returns {Promise<Idea>}
 */
export async function archive(userId, ideaId) {
  const idea = await Idea.findOne({ where: { id: ideaId, userId } });

  if (!idea) {
    throw new AppError('Idea not found', { statusCode: 404, code: 'not_found' });
  }

  if (idea.status === 'promoted') {
    throw new AppError('Cannot archive promoted idea', {
      statusCode: 400,
      code: 'idea_promoted',
    });
  }

  if (idea.status === 'archived') {
    throw new AppError('Idea is already archived', {
      statusCode: 400,
      code: 'already_archived',
    });
  }

  await idea.update({ status: 'archived' });

  return {
    id: idea.id,
    title: idea.title,
    description: idea.description,
    tags: idea.tags,
    status: idea.status,
    priority: idea.priority,
    createdAt: idea.createdAt,
    updatedAt: idea.updatedAt,
  };
}

/**
 * Unarchive an idea (restore to active)
 * @param {string} userId - User ID
 * @param {string} ideaId - Idea ID
 * @returns {Promise<Idea>}
 */
export async function unarchive(userId, ideaId) {
  const idea = await Idea.findOne({ where: { id: ideaId, userId } });

  if (!idea) {
    throw new AppError('Idea not found', { statusCode: 404, code: 'not_found' });
  }

  if (idea.status !== 'archived') {
    throw new AppError('Idea is not archived', {
      statusCode: 400,
      code: 'not_archived',
    });
  }

  await idea.update({ status: 'active' });

  return {
    id: idea.id,
    title: idea.title,
    description: idea.description,
    tags: idea.tags,
    status: idea.status,
    priority: idea.priority,
    createdAt: idea.createdAt,
    updatedAt: idea.updatedAt,
  };
}

/**
 * Promote an idea to a project
 * Creates a basic project from the idea and links them
 * @param {Object} user - User object
 * @param {string} ideaId - Idea ID
 * @returns {Promise<{idea: Idea, project: Project}>}
 */
export async function promoteToProject(user, ideaId) {
  const idea = await Idea.findOne({ where: { id: ideaId, userId: user.id } });

  if (!idea) {
    throw new AppError('Idea not found', { statusCode: 404, code: 'not_found' });
  }

  if (idea.status === 'promoted') {
    throw new AppError('Idea is already promoted', {
      statusCode: 400,
      code: 'already_promoted',
    });
  }

  if (idea.status === 'archived') {
    throw new AppError('Cannot promote archived idea', {
      statusCode: 400,
      code: 'idea_archived',
    });
  }

  // Check project limit for free users
  if (user.tier === 'free') {
    const projectCount = await Project.count({
      where: {
        userId: user.id,
        status: { [Op.ne]: 'cancelled' },
      },
    });

    if (projectCount >= 1) {
      throw new AppError('Free plan permite un solo proyecto activo', {
        statusCode: 403,
        code: 'free_project_limit',
      });
    }
  }

  const result = await sequelize.transaction(async (transaction) => {
    // Create the project from idea
    const project = await Project.create(
      {
        userId: user.id,
        title: idea.title,
        description: idea.description,
        status: 'active',
        progress: 0,
        area: 'general',
        planFormat: 'standard',
      },
      { transaction }
    );

    // Update idea status and link to project
    await idea.update(
      {
        status: 'promoted',
        promotedToProjectId: project.id,
      },
      { transaction }
    );

    return { idea, project };
  });

  return {
    idea: {
      id: result.idea.id,
      title: result.idea.title,
      description: result.idea.description,
      tags: result.idea.tags,
      status: result.idea.status,
      priority: result.idea.priority,
      promotedToProjectId: result.idea.promotedToProjectId,
      createdAt: result.idea.createdAt,
      updatedAt: result.idea.updatedAt,
    },
    project: {
      id: result.project.id,
      title: result.project.title,
      description: result.project.description,
      status: result.project.status,
      progress: result.project.progress,
      createdAt: result.project.createdAt,
    },
  };
}

/**
 * Chat with AI about an idea (PRO feature)
 * @param {Object} user - User object with id and tier
 * @param {string} ideaId - Idea ID
 * @param {string} message - User message
 * @returns {Promise<{response: string}>}
 */
export async function chat(user, ideaId, message) {
  // Require PRO tier for AI chat
  if (user.tier !== 'pro') {
    throw new AppError('Chat IA requiere suscripcion Pro', {
      statusCode: 403,
      code: 'pro_tier_required',
      details: {
        feature: 'idea_chat',
        upgradeUrl: '/paywall',
      },
    });
  }

  const idea = await Idea.findOne({ where: { id: ideaId, userId: user.id } });

  if (!idea) {
    throw new AppError('Idea not found', { statusCode: 404, code: 'not_found' });
  }

  // TODO: Integrate with AI service for real responses
  // For now, return a mock response based on the idea context
  const mockResponses = [
    `Sobre tu idea "${idea.title}": Es un excelente punto de partida. Te sugiero empezar por definir los objetivos principales y luego dividirlos en tareas mas pequenas.`,
    `Analizando "${idea.title}": Considera validar esta idea con usuarios potenciales antes de invertir mucho tiempo. Puedes crear un MVP rapido para probar.`,
    `Respecto a "${idea.title}": Una buena estrategia seria identificar los recursos que necesitas y estimar el tiempo requerido para cada fase del proyecto.`,
    `Para "${idea.title}": Te recomiendo crear un cronograma con hitos claros. Esto te ayudara a mantener el enfoque y medir tu progreso.`,
  ];

  const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

  return {
    response: randomResponse,
    ideaId: idea.id,
    ideaTitle: idea.title,
  };
}
