import axios from 'axios';
import { Op } from 'sequelize';

import sequelize from '../config/database.js';
import { AppError } from '../errors/app-error.js';
import { Milestone, Objective, Phase, Project, Task } from '../models/index.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3001';

function sanitizePlanPreferences(area, planFormat) {
  const allowedAreas = ['marketing', 'product', 'operations', 'general'];
  const allowedFormats = ['lean', 'standard', 'detailed'];
  return {
    area: allowedAreas.includes(area) ? area : 'general',
    planFormat: allowedFormats.includes(planFormat) ? planFormat : 'standard',
  };
}

async function enforceProjectLimit(user) {
  if (user.tier === 'pro') return;
  const count = await Project.count({
    where: {
      userId: user.id,
      status: { [Op.ne]: 'cancelled' },
    },
  });
  if (count >= 1) {
    throw new AppError('Free plan permite un solo proyecto activo', {
      statusCode: 403,
      code: 'free_project_limit',
    });
  }
}

export async function create(user, { title, description, targetDate, area, planFormat }) {
  await enforceProjectLimit(user);
  const normalized = sanitizePlanPreferences(area, planFormat);
  return Project.create({
    userId: user.id,
    title,
    description,
    targetDate,
    area: normalized.area,
    planFormat: normalized.planFormat,
    status: 'active',
    progress: 0,
  });
}

export async function getAll(userId) {
  const projects = await Project.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });

  const results = [];
  for (const project of projects) {
    const nextMilestone = await Milestone.findOne({
      include: [{ model: Phase, where: { projectId: project.id } }],
      where: { completed: false },
      order: [['dueDate', 'ASC']],
    });

    results.push({
      id: project.id,
      title: project.title,
      description: project.description,
      area: project.area,
      planFormat: project.planFormat,
      status: project.status,
      progress: project.progress,
      targetDate: project.targetDate,
      createdAt: project.createdAt,
      nextMilestone: nextMilestone
        ? { title: nextMilestone.title, dueDate: nextMilestone.dueDate }
        : null,
    });
  }

  return results;
}

export async function getById(userId, projectId) {
  const project = await Project.findOne({ where: { id: projectId, userId } });
  if (!project) {
    throw new AppError('Project not found', { statusCode: 404, code: 'not_found' });
  }

  const objectives = await Objective.findAll({
    where: { projectId: project.id },
    order: [['orderIndex', 'ASC']],
  });
  const phases = await Phase.findAll({
    where: { projectId: project.id },
    order: [['orderIndex', 'ASC']],
    include: [{ model: Milestone }],
  });
  const tasks = await Task.findAll({
    where: { projectId: project.id },
    order: [['createdAt', 'ASC']],
  });

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    area: project.area,
    planFormat: project.planFormat,
    status: project.status,
    progress: project.progress,
    targetDate: project.targetDate,
    objectives: objectives.map((o) => o.description),
    phases: phases.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      orderIndex: p.orderIndex,
      milestones: (p.Milestones || [])
        .slice()
        .sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return String(a.dueDate).localeCompare(String(b.dueDate));
        })
        .map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          dueDate: m.dueDate,
          completed: m.completed,
          completedAt: m.completedAt,
        })),
    })),
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      responsible: t.responsible,
      notes: t.notes,
      deliverables: t.deliverables,
      dependencies: t.dependencies,
      metrics: t.metrics,
      status: t.status,
      priority: t.priority,
      estimatedHours: t.estimatedHours,
      dueDate: t.dueDate,
      completedAt: t.completedAt,
      phaseId: t.phaseId,
      milestoneId: t.milestoneId,
    })),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export async function update(userId, projectId, updates) {
  const project = await Project.findOne({ where: { id: projectId, userId } });
  if (!project) {
    throw new AppError('Project not found', { statusCode: 404, code: 'not_found' });
  }
  const nextUpdates = { ...updates };
  if ('area' in nextUpdates || 'planFormat' in nextUpdates) {
    const normalized = sanitizePlanPreferences(nextUpdates.area, nextUpdates.planFormat);
    if ('area' in nextUpdates) nextUpdates.area = normalized.area;
    if ('planFormat' in nextUpdates) nextUpdates.planFormat = normalized.planFormat;
  }
  return project.update(nextUpdates);
}

export async function destroy(userId, projectId) {
  const project = await Project.findOne({ where: { id: projectId, userId } });
  if (!project) {
    throw new AppError('Project not found', { statusCode: 404, code: 'not_found' });
  }
  await project.update({ status: 'cancelled' });
}

export async function createWithAI(
  user,
  { idea, availableHoursPerWeek, targetDate, area, planFormat }
) {
  await enforceProjectLimit(user);
  const normalized = sanitizePlanPreferences(area, planFormat);
  let plan;
  try {
    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/generate-plan`,
      {
        idea,
        availableHoursPerWeek,
        targetDate,
        area: normalized.area,
        planFormat: normalized.planFormat,
      },
      { timeout: 60_000 }
    );
    plan = aiRes.data;
  } catch (_err) {
    throw new AppError('AI service unavailable', {
      statusCode: 502,
      code: 'ai_unavailable',
    });
  }

  const created = await sequelize.transaction(async (transaction) => {
    const project = await Project.create(
      {
        userId: user.id,
        title: plan.title,
        description: idea,
        targetDate,
        area: normalized.area,
        planFormat: normalized.planFormat,
        status: 'active',
        progress: 0,
      },
      { transaction }
    );

    const objectives = [];
    for (let i = 0; i < plan.objectives.length; i += 1) {
      const objective = await Objective.create(
        {
          projectId: project.id,
          description: plan.objectives[i],
          orderIndex: i,
        },
        { transaction }
      );
      objectives.push(objective);
    }

    const phases = [];
    for (const phaseData of plan.phases) {
      const phase = await Phase.create(
        {
          projectId: project.id,
          name: phaseData.name,
          description: phaseData.description,
          orderIndex: phaseData.order ?? phaseData.orderIndex ?? 0,
        },
        { transaction }
      );

      const milestones = [];
      for (const milestoneData of phaseData.milestones || []) {
        const milestone = await Milestone.create(
          {
            phaseId: phase.id,
            title: milestoneData.title,
            dueDate: milestoneData.dueDate,
          },
          { transaction }
        );
        milestones.push(milestone);
      }

      phases.push({ phase, milestones });
    }

    const initialTasks = [];
    for (const taskData of plan.initialTasks || []) {
      const task = await Task.create(
        {
          projectId: project.id,
          title: taskData.title,
          description: taskData.description,
          estimatedHours: taskData.estimatedHours,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          status: 'pending',
        },
        { transaction }
      );
      initialTasks.push(task);
    }

    return { project, objectives, phases, initialTasks };
  });

  return {
    project: {
      id: created.project.id,
      title: created.project.title,
      description: created.project.description,
      targetDate: created.project.targetDate,
      area: created.project.area,
      planFormat: created.project.planFormat,
    },
    plan: {
      objectives: created.objectives.map((o) => o.description),
      phases: created.phases
        .sort((a, b) => a.phase.orderIndex - b.phase.orderIndex)
        .map(({ phase, milestones }) => ({
          id: phase.id,
          name: phase.name,
          description: phase.description,
          milestones: milestones.map((m) => ({
            id: m.id,
            title: m.title,
            dueDate: m.dueDate,
          })),
        })),
      initialTasks: created.initialTasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        estimatedHours: t.estimatedHours,
        dueDate: t.dueDate,
      })),
    },
  };
}
