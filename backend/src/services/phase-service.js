import { Op } from 'sequelize';

import sequelize from '../config/database.js';
import { AppError } from '../errors/app-error.js';
import { Phase, Project } from '../models/index.js';

async function ensureProject(userId, projectId) {
  const project = await Project.findOne({ where: { id: projectId, userId } });
  if (!project) {
    throw new AppError('Project not found', { statusCode: 404, code: 'not_found' });
  }
  return project;
}

export async function updatePhase(userId, projectId, phaseId, payload) {
  await ensureProject(userId, projectId);
  const phase = await Phase.findOne({ where: { id: phaseId, projectId } });
  if (!phase) {
    throw new AppError('Phase not found', { statusCode: 404, code: 'phase_not_found' });
  }

  const updated = await phase.update(payload);
  return {
    id: updated.id,
    name: updated.name,
    description: updated.description,
    orderIndex: updated.orderIndex,
  };
}

export async function reorderPhases(userId, projectId, entries) {
  await ensureProject(userId, projectId);

  return sequelize.transaction(async (transaction) => {
    const seenIds = new Set();
    let orderIndex = 0;
    const results = [];

    for (const entry of entries) {
      let phase;
      if (entry.id) {
        phase = await Phase.findOne({ where: { id: entry.id, projectId }, transaction });
        if (!phase) {
          throw new AppError('Phase not found', { statusCode: 404, code: 'phase_not_found' });
        }
        await phase.update(
          {
            orderIndex,
            name: entry.name ?? phase.name,
            description: entry.description ?? phase.description,
          },
          { transaction }
        );
      } else {
        phase = await Phase.create(
          {
            projectId,
            name: entry.name,
            description: entry.description,
            orderIndex,
          },
          { transaction }
        );
      }
      seenIds.add(phase.id);
      results.push({
        id: phase.id,
        name: phase.name,
        description: phase.description,
        orderIndex,
      });
      orderIndex += 1;
    }

    const remaining = await Phase.findAll({
      where: {
        projectId,
        id: seenIds.size ? { [Op.notIn]: Array.from(seenIds) } : { [Op.not]: null },
      },
      order: [['orderIndex', 'ASC']],
      transaction,
    });

    for (const phase of remaining) {
      await phase.update({ orderIndex }, { transaction });
      results.push({
        id: phase.id,
        name: phase.name,
        description: phase.description,
        orderIndex,
      });
      orderIndex += 1;
    }

    return results;
  });
}
