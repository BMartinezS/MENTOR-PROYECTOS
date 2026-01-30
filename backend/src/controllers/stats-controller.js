import * as StreakService from '../services/streak-service.js';

/**
 * Get stats for the authenticated user
 * GET /api/stats/me
 */
export async function getMyStats(req, res, next) {
  try {
    const stats = await StreakService.getStats(req.user.id);
    res.json({ stats });
  } catch (err) {
    next(err);
  }
}

/**
 * Get leaderboard (top 10 users by XP)
 * GET /api/stats/leaderboard
 */
export async function getLeaderboard(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const leaderboard = await StreakService.getLeaderboard(limit);
    res.json({ leaderboard });
  } catch (err) {
    next(err);
  }
}
