import { UserStats } from '../models/index.js';
import * as AchievementService from './achievement-service.js';

/**
 * Get or create UserStats for a given user
 * @param {string} userId - The user ID
 * @returns {Promise<UserStats>} The user stats
 */
async function getOrCreateStats(userId) {
  const [stats] = await UserStats.findOrCreate({
    where: { userId },
    defaults: {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastCheckinDate: null,
      totalXP: 0,
      totalTasksCompleted: 0,
      totalProjectsCompleted: 0,
      totalCheckinsCompleted: 0,
    },
  });
  return stats;
}

/**
 * Get today's date in YYYY-MM-DD format (date only, no time)
 * @returns {string} Today's date
 */
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 * @returns {string} Yesterday's date
 */
function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Update streak when user makes a check-in
 * - If lastCheckinDate is yesterday: currentStreak++
 * - If lastCheckinDate is today: no change
 * - If lastCheckinDate is older: currentStreak = 1
 * Also updates longestStreak if currentStreak exceeds it
 * @param {string} userId - The user ID
 * @returns {Promise<{currentStreak: number, longestStreak: number, streakIncreased: boolean}>}
 */
export async function updateStreak(userId) {
  const stats = await getOrCreateStats(userId);
  const today = getTodayDate();
  const yesterday = getYesterdayDate();

  let currentStreak = stats.currentStreak;
  let longestStreak = stats.longestStreak;
  let streakIncreased = false;

  const lastCheckinStr = stats.lastCheckinDate
    ? new Date(stats.lastCheckinDate).toISOString().split('T')[0]
    : null;

  if (lastCheckinStr === today) {
    // Already checked in today, no streak change
    return { currentStreak, longestStreak, streakIncreased: false };
  }

  if (lastCheckinStr === yesterday) {
    // Consecutive day, increase streak
    currentStreak += 1;
    streakIncreased = true;
  } else {
    // Either first check-in or broke the streak
    currentStreak = 1;
    streakIncreased = stats.currentStreak === 0;
  }

  // Update longest streak if current is higher
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Update the stats
  await stats.update({
    currentStreak,
    longestStreak,
    lastCheckinDate: today,
    totalCheckinsCompleted: stats.totalCheckinsCompleted + 1,
  });

  // Check and unlock streak-related achievements
  let newlyUnlockedAchievements = [];
  try {
    newlyUnlockedAchievements = await AchievementService.checkStreakAchievements(userId, currentStreak);
  } catch (err) {
    // Log but don't fail the streak update
    console.error('Error checking streak achievements:', err.message);
  }

  return { currentStreak, longestStreak, streakIncreased, newlyUnlockedAchievements };
}

/**
 * Add XP to user stats
 * @param {string} userId - The user ID
 * @param {number} amount - Amount of XP to add
 * @param {string} reason - Reason for XP gain (for logging)
 * @returns {Promise<{totalXP: number, addedXP: number}>}
 */
export async function addXP(userId, amount, reason) {
  const stats = await getOrCreateStats(userId);

  const newTotalXP = stats.totalXP + amount;

  await stats.update({
    totalXP: newTotalXP,
  });

  return { totalXP: newTotalXP, addedXP: amount };
}

/**
 * Increment task completed counter
 * @param {string} userId - The user ID
 * @returns {Promise<{totalTasksCompleted: number}>}
 */
export async function incrementTasksCompleted(userId) {
  const stats = await getOrCreateStats(userId);

  const newTotal = stats.totalTasksCompleted + 1;

  await stats.update({
    totalTasksCompleted: newTotal,
  });

  return { totalTasksCompleted: newTotal };
}

/**
 * Increment project completed counter
 * @param {string} userId - The user ID
 * @returns {Promise<{totalProjectsCompleted: number}>}
 */
export async function incrementProjectsCompleted(userId) {
  const stats = await getOrCreateStats(userId);

  const newTotal = stats.totalProjectsCompleted + 1;

  await stats.update({
    totalProjectsCompleted: newTotal,
  });

  return { totalProjectsCompleted: newTotal };
}

/**
 * Get user stats
 * @param {string} userId - The user ID
 * @returns {Promise<object>} The user stats
 */
export async function getStats(userId) {
  const stats = await getOrCreateStats(userId);

  return {
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    lastCheckinDate: stats.lastCheckinDate,
    totalXP: stats.totalXP,
    totalTasksCompleted: stats.totalTasksCompleted,
    totalProjectsCompleted: stats.totalProjectsCompleted,
    totalCheckinsCompleted: stats.totalCheckinsCompleted,
  };
}

/**
 * Get top users by XP for leaderboard
 * @param {number} limit - Number of users to return (default 10)
 * @returns {Promise<Array>} Top users with their stats
 */
export async function getLeaderboard(limit = 10) {
  const topStats = await UserStats.findAll({
    order: [['totalXP', 'DESC']],
    limit,
    include: [
      {
        association: 'User',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  return topStats.map((stats) => ({
    userId: stats.userId,
    userName: stats.User?.name || 'Usuario',
    totalXP: stats.totalXP,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
  }));
}
