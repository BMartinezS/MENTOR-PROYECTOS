import axios from 'axios';

import { AppError } from '../errors/app-error.js';
import { PlanIteration, Project } from '../models/index.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3001';

function sanitizeIteration(iteration) {
  return {
    id: iteration.id,
    projectId: iteration.projectId,
    userId: iteration.userId,
    iterationNumber: iteration.iterationNumber,
    feedback: iteration.feedback,
    focusArea: iteration.focusArea,
    planSnapshot: iteration.planSnapshot,
    createdAt: iteration.createdAt,
  };
}

async function loadProject(userId, projectId) {
  const project = await Project.findOne({ where: { id: projectId, userId } });
  if (!project) {
    throw new AppError('Project not found', { statusCode: 404, code: 'not_found' });
  }
  return project;
}

export async function list(userId, projectId) {
  await loadProject(userId, projectId);
  const iterations = await PlanIteration.findAll({
    where: { projectId },
    order: [['iterationNumber', 'ASC']],
  });
  return iterations.map(sanitizeIteration);
}

export async function create(user, projectId, { feedback, focusArea }) {
  const project = await loadProject(user.id, projectId);

  if (user.tier === 'free') {
    const existing = await PlanIteration.count({ where: { projectId } });
    if (existing >= 2) {
      throw new AppError('Free plan permite hasta 2 iteraciones por proyecto', {
        statusCode: 403,
        code: 'free_iteration_limit',
        details: {
          currentCount: existing,
          limit: 2,
        },
      });
    }
  }

  let aiPayload;
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/plan-iteration`,
      {
        project: {
          title: project.title,
          description: project.description,
          area: project.area,
          planFormat: project.planFormat,
          targetDate: project.targetDate,
        },
        feedback,
        focusArea,
      },
      { timeout: 60_000 }
    );
    aiPayload = response.data?.plan ?? response.data;
  } catch (err) {
    throw new AppError('AI service unavailable', { statusCode: 502, code: 'ai_unavailable' });
  }

  if (!aiPayload || typeof aiPayload !== 'object') {
    throw new AppError('Invalid AI response', { statusCode: 502, code: 'ai_invalid_response' });
  }

  const lastIteration = (await PlanIteration.max('iterationNumber', { where: { projectId } })) || 0;
  const iteration = await PlanIteration.create({
    projectId,
    userId: user.id,
    iterationNumber: lastIteration + 1,
    feedback,
    focusArea,
    planSnapshot: aiPayload,
  });

  return sanitizeIteration(iteration);
}
