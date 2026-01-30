import axios from 'axios';
import { Op } from 'sequelize';

import { AppError } from '../errors/app-error.js';
import { Checkin, Project, Task, User } from '../models/index.js';
import * as StreakService from './streak-service.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3001';
const FREE_CHECKIN_WEEKLY_LIMIT = 2;

function getWeekStartDate() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 7);
  return start;
}

async function hasReachedFreeCheckinLimit(userId) {
  const start = getWeekStartDate();
  const weeklyCount = await Checkin.count({
    where: {
      userId,
      createdAt: { [Op.gte]: start },
    },
  });
  return weeklyCount >= FREE_CHECKIN_WEEKLY_LIMIT;
}

export async function getPending(userId) {
  const checkins = await Checkin.findAll({
    where: { userId, respondedAt: null },
    order: [['createdAt', 'ASC']],
  });

  return checkins.map((c) => ({
    id: c.id,
    projectId: c.projectId,
    type: c.type,
    message: c.message,
    createdAt: c.createdAt,
  }));
}

export async function respond(checkinId, userId, response) {
  const checkin = await Checkin.findOne({ where: { id: checkinId, userId } });
  if (!checkin) {
    throw new AppError('Checkin not found', { statusCode: 404, code: 'not_found' });
  }

  const updated = await checkin.update({
    respondedAt: new Date(),
    response,
  });

  // Update streak when user responds to a check-in
  const streakResult = await StreakService.updateStreak(userId);

  // Award XP for completing a check-in
  const XP_CHECKIN_COMPLETE = 10;
  await StreakService.addXP(userId, XP_CHECKIN_COMPLETE, 'checkin_complete');

  return {
    id: updated.id,
    respondedAt: updated.respondedAt,
    response: updated.response,
    streak: streakResult,
  };
}

export async function generateAndCreate(userId, projectId) {
  const project = await Project.findOne({
    where: { id: projectId, userId },
    include: [
      { model: User },
      {
        model: Task,
        where: { status: 'pending' },
        required: false,
        limit: 1,
        order: [['createdAt', 'ASC']],
      },
    ],
  });

  if (!project) {
    throw new AppError('Project not found', { statusCode: 404, code: 'not_found' });
  }

  if (project.User?.tier === 'free') {
    const reachedLimit = await hasReachedFreeCheckinLimit(userId);
    if (reachedLimit) {
      return null;
    }
  }

  const nextTask = project.Tasks?.[0]?.title || 'iniciar proyecto';
  const context = {
    userName: project.User?.name || 'usuario',
    projectTitle: project.title,
    nextTask,
    daysSinceProgress: 0,
    tone: project.User?.preferences?.mentorTone || 'normal',
  };

  let message;
  try {
    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/generate-checkin`,
      { context },
      { timeout: 15_000 }
    );
    message = aiRes.data.message;
  } catch (_err) {
    message = `Tu foco es: ${nextTask}. ¿Lo vas a hacer hoy?`;
  }

  return Checkin.create({
    userId,
    projectId,
    type: 'daily',
    message,
  });
}

