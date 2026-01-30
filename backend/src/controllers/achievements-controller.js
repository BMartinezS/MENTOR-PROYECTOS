import * as AchievementService from '../services/achievement-service.js';

export async function getAll(_req, res, next) {
  try {
    const achievements = await AchievementService.getAvailableAchievements();
    res.json({ achievements });
  } catch (err) {
    next(err);
  }
}

export async function getMine(req, res, next) {
  try {
    const achievements = await AchievementService.getUserAchievements(req.user.id);
    res.json({ achievements });
  } catch (err) {
    next(err);
  }
}

export async function checkAndUnlock(req, res, next) {
  try {
    const newlyUnlocked = await AchievementService.checkAndUnlock(req.user.id);
    res.json({ newlyUnlocked });
  } catch (err) {
    next(err);
  }
}
