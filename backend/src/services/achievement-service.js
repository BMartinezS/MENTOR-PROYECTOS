import { Op } from 'sequelize';

import { Achievement, Checkin, Project, Task, UserAchievement, UserStats } from '../models/index.js';

// All available achievements in the system
export const ACHIEVEMENTS = [
  // Checkin achievements
  {
    id: 'first_checkin',
    name: 'Primer Check-in',
    description: 'Completa tu primer check-in',
    icon: 'check-circle',
    xpReward: 50,
    category: 'checkin',
    requirement: { type: 'checkin_count', value: 1 },
  },
  {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Completa un check-in antes de las 8am',
    icon: 'sunrise',
    xpReward: 100,
    category: 'checkin',
    requirement: { type: 'early_checkin', value: 8 },
  },

  // Streak achievements
  {
    id: 'streak_3',
    name: 'Racha de 3 dias',
    description: 'Mantiene una racha de 3 dias seguidos',
    icon: 'flame',
    xpReward: 100,
    category: 'streak',
    requirement: { type: 'streak', value: 3 },
  },
  {
    id: 'streak_7',
    name: 'Una semana de fuego',
    description: 'Mantiene una racha de 7 dias seguidos',
    icon: 'flame',
    xpReward: 250,
    category: 'streak',
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'streak_30',
    name: 'Un mes imparable',
    description: 'Mantiene una racha de 30 dias seguidos',
    icon: 'fire',
    xpReward: 1000,
    category: 'streak',
    requirement: { type: 'streak', value: 30 },
  },

  // Project achievements
  {
    id: 'first_project',
    name: 'Primer Proyecto',
    description: 'Crea tu primer proyecto',
    icon: 'folder-plus',
    xpReward: 50,
    category: 'project',
    requirement: { type: 'project_count', value: 1 },
  },
  {
    id: 'project_completed',
    name: 'Mision Cumplida',
    description: 'Completa tu primer proyecto al 100%',
    icon: 'trophy',
    xpReward: 500,
    category: 'project',
    requirement: { type: 'project_completed', value: 1 },
  },

  // Task achievements
  {
    id: 'tasks_10',
    name: 'Productivo',
    description: 'Completa 10 tareas',
    icon: 'check-square',
    xpReward: 100,
    category: 'task',
    requirement: { type: 'task_count', value: 10 },
  },
  {
    id: 'tasks_50',
    name: 'Super Productivo',
    description: 'Completa 50 tareas',
    icon: 'check-square',
    xpReward: 300,
    category: 'task',
    requirement: { type: 'task_count', value: 50 },
  },
  {
    id: 'tasks_100',
    name: 'Maquina de Tareas',
    description: 'Completa 100 tareas',
    icon: 'zap',
    xpReward: 500,
    category: 'task',
    requirement: { type: 'task_count', value: 100 },
  },
];

/**
 * Initialize achievements in database (run once on startup or migration)
 */
export async function seedAchievements() {
  for (const achievement of ACHIEVEMENTS) {
    await Achievement.upsert(achievement);
  }
}

/**
 * Get all available achievements
 */
export async function getAvailableAchievements() {
  // Return from constant to avoid DB hit for static data
  return ACHIEVEMENTS.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    icon: a.icon,
    xpReward: a.xpReward,
    category: a.category,
  }));
}

/**
 * Get achievements unlocked by a specific user
 */
export async function getUserAchievements(userId) {
  const userAchievements = await UserAchievement.findAll({
    where: { userId },
    order: [['unlockedAt', 'DESC']],
  });

  const achievementMap = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

  return userAchievements.map((ua) => {
    const achievement = achievementMap.get(ua.achievementId);
    return {
      id: ua.achievementId,
      name: achievement?.name || ua.achievementId,
      description: achievement?.description || '',
      icon: achievement?.icon || 'award',
      xpReward: achievement?.xpReward || 0,
      category: achievement?.category || 'unknown',
      unlockedAt: ua.unlockedAt,
    };
  });
}

/**
 * Check if a specific achievement is already unlocked for a user
 */
async function isAchievementUnlocked(userId, achievementId) {
  const existing = await UserAchievement.findOne({
    where: { userId, achievementId },
  });
  return !!existing;
}

/**
 * Unlock an achievement for a user and award XP
 * Returns the achievement if newly unlocked, null if already had it
 */
async function unlockAchievement(userId, achievementId) {
  const alreadyUnlocked = await isAchievementUnlocked(userId, achievementId);
  if (alreadyUnlocked) {
    return null;
  }

  await UserAchievement.create({
    userId,
    achievementId,
    unlockedAt: new Date(),
  });

  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);

  // Award XP for the achievement
  if (achievement && achievement.xpReward > 0) {
    const userStats = await UserStats.findOne({ where: { userId } });
    if (userStats) {
      await userStats.update({
        totalXP: userStats.totalXP + achievement.xpReward,
      });
    }
  }

  return achievement || null;
}

/**
 * Get user stats needed for achievement checks
 */
async function getUserStats(userId) {
  const [checkinCount, projectCount, completedProjectCount, taskCount] = await Promise.all([
    Checkin.count({
      where: { userId, respondedAt: { [Op.ne]: null } },
    }),
    Project.count({
      where: { userId },
    }),
    Project.count({
      where: { userId, progress: 100 },
    }),
    Task.count({
      where: {
        status: 'completed',
      },
      include: [
        {
          model: Project,
          where: { userId },
          required: true,
        },
      ],
    }),
  ]);

  // Check for early checkin (before 8am)
  const earlyCheckin = await Checkin.findOne({
    where: {
      userId,
      respondedAt: { [Op.ne]: null },
    },
  });

  let hasEarlyCheckin = false;
  if (earlyCheckin && earlyCheckin.respondedAt) {
    const hour = new Date(earlyCheckin.respondedAt).getHours();
    hasEarlyCheckin = hour < 8;
  }

  // Get user's current streak from UserStats
  const userStats = await UserStats.findOne({ where: { userId } });
  const currentStreak = userStats?.currentStreak || 0;

  return {
    checkinCount,
    projectCount,
    completedProjectCount,
    taskCount,
    hasEarlyCheckin,
    currentStreak,
  };
}

/**
 * Check and unlock all eligible achievements for a user
 * Returns array of newly unlocked achievements
 */
export async function checkAndUnlock(userId) {
  const stats = await getUserStats(userId);
  const newlyUnlocked = [];

  for (const achievement of ACHIEVEMENTS) {
    const { requirement } = achievement;
    let shouldUnlock = false;

    switch (requirement.type) {
      case 'checkin_count':
        shouldUnlock = stats.checkinCount >= requirement.value;
        break;
      case 'early_checkin':
        shouldUnlock = stats.hasEarlyCheckin;
        break;
      case 'streak':
        shouldUnlock = stats.currentStreak >= requirement.value;
        break;
      case 'project_count':
        shouldUnlock = stats.projectCount >= requirement.value;
        break;
      case 'project_completed':
        shouldUnlock = stats.completedProjectCount >= requirement.value;
        break;
      case 'task_count':
        shouldUnlock = stats.taskCount >= requirement.value;
        break;
      default:
        break;
    }

    if (shouldUnlock) {
      const unlocked = await unlockAchievement(userId, achievement.id);
      if (unlocked) {
        newlyUnlocked.push({
          id: unlocked.id,
          name: unlocked.name,
          description: unlocked.description,
          icon: unlocked.icon,
          xpReward: unlocked.xpReward,
          category: unlocked.category,
        });
      }
    }
  }

  return newlyUnlocked;
}

/**
 * Check achievements specifically triggered by streak updates
 * Call this when streak changes
 */
export async function checkStreakAchievements(userId, currentStreak) {
  const streakAchievements = ACHIEVEMENTS.filter((a) => a.requirement.type === 'streak');
  const newlyUnlocked = [];

  for (const achievement of streakAchievements) {
    if (currentStreak >= achievement.requirement.value) {
      const unlocked = await unlockAchievement(userId, achievement.id);
      if (unlocked) {
        newlyUnlocked.push({
          id: unlocked.id,
          name: unlocked.name,
          description: unlocked.description,
          icon: unlocked.icon,
          xpReward: unlocked.xpReward,
          category: unlocked.category,
        });
      }
    }
  }

  return newlyUnlocked;
}
