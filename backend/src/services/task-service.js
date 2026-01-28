import { AppError } from '../errors/app-error.js';
import { Phase, ProgressLog, Project, Task } from '../models/index.js';

async function recalcProjectProgress(projectId) {
  const total = await Task.count({ where: { projectId } });
  if (total === 0) {
    await Project.update({ progress: 0 }, { where: { id: projectId } });
    return 0;
  }

  const completed = await Task.count({
    where: { projectId, status: 'completed' },
  });
  const progress = Math.round((completed / total) * 100);
  await Project.update({ progress }, { where: { id: projectId } });
  return progress;
}

function sanitizeTask(task) {
  return {
    id: task.id,
    projectId: task.projectId,
    phaseId: task.phaseId,
    milestoneId: task.milestoneId,
    title: task.title,
    description: task.description,
    responsible: task.responsible,
    notes: task.notes,
    deliverables: task.deliverables || [],
    dependencies: task.dependencies || [],
    metrics: task.metrics || [],
    status: task.status,
    priority: task.priority,
    estimatedHours: task.estimatedHours,
    dueDate: task.dueDate,
    completedAt: task.completedAt,
    blockedReason: task.blockedReason,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

export async function getById(userId, taskId) {
  const task = await Task.findByPk(taskId, { include: [Project] });
  if (!task || !task.Project || task.Project.userId !== userId) {
    throw new AppError('Task not found', { statusCode: 404, code: 'not_found' });
  }
  return sanitizeTask(task);
}

export async function update(user, taskId, payload) {
  if (user.tier !== 'pro') {
    throw new AppError('Solo usuarios Pro pueden editar tareas', {
      statusCode: 403,
      code: 'pro_only',
    });
  }

  const task = await Task.findByPk(taskId, { include: [Project] });
  if (!task || !task.Project || task.Project.userId !== user.id) {
    throw new AppError('Task not found', { statusCode: 404, code: 'not_found' });
  }

  const updates = { ...payload };

  if (Object.prototype.hasOwnProperty.call(payload, 'phaseId')) {
    if (!payload.phaseId) {
      updates.phaseId = null;
    } else {
      const phase = await Phase.findOne({ where: { id: payload.phaseId, projectId: task.projectId } });
      if (!phase) {
        throw new AppError('Phase not found', { statusCode: 404, code: 'phase_not_found' });
      }
      updates.phaseId = phase.id;
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'deliverables')) {
    updates.deliverables = payload.deliverables;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'dependencies')) {
    updates.dependencies = payload.dependencies;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'metrics')) {
    updates.metrics = payload.metrics;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'dueDate')) {
    updates.dueDate = payload.dueDate || null;
  }

  const updatedTask = await task.update(updates);
  return sanitizeTask(updatedTask);
}

export async function complete(userId, taskId, { notes, evidenceUrl }) {
  const task = await Task.findByPk(taskId, { include: [Project] });
  if (!task || !task.Project || task.Project.userId !== userId) {
    throw new AppError('Task not found', { statusCode: 404, code: 'not_found' });
  }

  if (task.status !== 'completed') {
    await task.update({ status: 'completed', completedAt: new Date() });
  }

  const progressLog = await ProgressLog.create({
    taskId: task.id,
    userId,
    notes,
    evidenceType: evidenceUrl ? 'link' : notes ? 'text' : null,
    evidenceContent: evidenceUrl || null,
  });

  await recalcProjectProgress(task.projectId);

  return {
    task: {
      id: task.id,
      status: task.status,
      completedAt: task.completedAt,
    },
    progressLog: {
      id: progressLog.id,
      notes: progressLog.notes,
      evidenceUrl: evidenceUrl || null,
      createdAt: progressLog.createdAt,
    },
  };
}

