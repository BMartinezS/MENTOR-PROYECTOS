import axios from 'axios';
import { Op } from 'sequelize';

import { AppError } from '../errors/app-error.js';
import { Project, Task, WeeklyReview, User } from '../models/index.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3001';
const DEFAULT_TARGET_HOURS = Number(process.env.WEEKLY_REVIEW_TARGET_HOURS || 10);

function getWeekWindow() {
  const end = new Date();
  const start = new Date(end);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 7);
  return { start, end };
}

function sanitizeReview(review) {
  return {
    id: review.id,
    projectId: review.projectId,
    userId: review.userId,
    summary: review.summary,
    questions: review.questions,
    suggestions: review.suggestions,
    userAnswers: review.userAnswers,
    weekStartDate: review.weekStartDate,
    weekEndDate: review.weekEndDate,
    createdAt: review.createdAt,
  };
}

async function loadProject(userId, projectId, { includeUser = false } = {}) {
  const include = includeUser ? [{ model: User }] : undefined;
  const project = await Project.findOne({ where: { id: projectId, userId }, include });
  if (!project) {
    throw new AppError('Project not found', { statusCode: 404, code: 'not_found' });
  }
  return project;
}

function buildStats(tasks, weekStart) {
  const completedThisWeek = tasks.filter(
    (task) =>
      task.status === 'completed' && task.completedAt && new Date(task.completedAt) >= weekStart
  );

  return {
    tasksCompleted: completedThisWeek.length,
    tasksPending: tasks.filter((task) => task.status === 'pending').length,
    blockedTasks: tasks.filter((task) => task.status === 'blocked').length,
    hoursSpent: completedThisWeek.reduce((sum, task) => sum + Number(task.estimatedHours || 0), 0),
  };
}

function buildFallbackReview(payload) {
  const summary = `En "${payload.projectTitle}" completaste ${payload.tasksCompleted} tareas y llevas ${payload.hoursSpent}h de ${payload.targetHours}h planificadas.`;
  return {
    summary,
    questions: [
      'Que ayudo mas a tu progreso esta semana?',
      'Que ajustaras para desbloquear lo que falta?',
    ],
    suggestions: [
      payload.tasksPending > 0
        ? 'Define la proxima tarea concreta y bloquea un bloque de tiempo.'
        : 'Celebra el avance y planifica los siguientes hitos.',
      payload.blockedTasks > 0
        ? 'Revisa las tareas bloqueadas y pide apoyo especifico.'
        : 'Sigue documentando tus aprendizajes para mantener el ritmo.',
    ],
  };
}

async function requestWeeklyReview(data) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/weekly-review`, { data }, { timeout: 15_000 });
    if (response?.data?.summary) {
      return {
        summary: response.data.summary,
        questions: response.data.questions || [],
        suggestions: response.data.suggestions || [],
      };
    }
    throw new Error('Invalid AI response');
  } catch (_err) {
    return buildFallbackReview(data);
  }
}

export async function generate(userId, projectId, { project } = {}) {
  let resolvedProject = project;
  if (!resolvedProject || !resolvedProject.User) {
    resolvedProject = await loadProject(userId, projectId, { includeUser: true });
  }
  const { start, end } = getWeekWindow();
  const tasks = await Task.findAll({ where: { projectId } });
  const stats = buildStats(tasks, start);
  const targetHours = resolvedProject.User?.preferences?.weeklyTargetHours || DEFAULT_TARGET_HOURS;

  const aiPayload = {
    projectTitle: resolvedProject.title,
    tasksCompleted: stats.tasksCompleted,
    tasksPending: stats.tasksPending,
    blockedTasks: stats.blockedTasks,
    hoursSpent: stats.hoursSpent,
    targetHours,
  };

  const aiResult = await requestWeeklyReview(aiPayload);

  const review = await WeeklyReview.create({
    projectId,
    userId,
    weekStartDate: start,
    weekEndDate: end,
    summary: aiResult.summary,
    questions: aiResult.questions,
    suggestions: aiResult.suggestions,
  });

  return sanitizeReview(review);
}

export async function getLatestForProject(userId, projectId) {
  const project = await loadProject(userId, projectId, { includeUser: true });
  const { start } = getWeekWindow();
  const existing = await WeeklyReview.findOne({
    where: {
      userId,
      projectId,
      weekEndDate: { [Op.gte]: start },
    },
    order: [['weekEndDate', 'DESC']],
  });

  if (existing) {
    return sanitizeReview(existing);
  }

  return generate(userId, projectId, { project });
}

export async function saveAnswers(reviewId, userId, answers) {
  const review = await WeeklyReview.findOne({ where: { id: reviewId, userId } });
  if (!review) {
    throw new AppError('Weekly review not found', { statusCode: 404, code: 'not_found' });
  }

  const updated = await review.update({ userAnswers: answers });
  return sanitizeReview(updated);
}
