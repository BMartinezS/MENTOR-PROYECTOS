/**
 * Level Calculation Utility
 *
 * Calculates user level based on XP using a progressive formula.
 * Level thresholds:
 * - Level 1: 0-99 XP
 * - Level 2: 100-299 XP
 * - Level 3: 300-599 XP
 * - Level 4: 600-999 XP
 * - Level 5: 1000-1499 XP
 * - Level 6: 1500-2099 XP
 * - Level 7: 2100-2799 XP
 * - Level 8: 2800-3599 XP
 * - Level 9: 3600-4499 XP
 * - Level 10: 4500+ XP
 *
 * Formula: level = floor(sqrt(XP / 50)) + 1, max 10
 */

export const MAX_LEVEL = 10;

/** XP thresholds for each level (minimum XP required) */
export const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 300,
  4: 600,
  5: 1000,
  6: 1500,
  7: 2100,
  8: 2800,
  9: 3600,
  10: 4500,
};

/** Level names in Spanish for UI display */
export const LEVEL_NAMES: Record<number, string> = {
  1: 'Novato',
  2: 'Aprendiz',
  3: 'Iniciado',
  4: 'Competente',
  5: 'Habil',
  6: 'Experto',
  7: 'Veterano',
  8: 'Maestro',
  9: 'Gran Maestro',
  10: 'Leyenda',
};

export interface LevelInfo {
  level: number;
  levelName: string;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number | null;
  xpProgress: number; // XP gained in current level
  xpNeeded: number; // XP needed for next level
  progressPercent: number; // 0-100 progress toward next level
  isMaxLevel: boolean;
}

/**
 * Calculate level from XP using the formula: floor(sqrt(XP / 50)) + 1
 * Capped at MAX_LEVEL (10)
 */
export function calculateLevel(xp: number): number {
  if (xp < 0) return 1;
  const rawLevel = Math.floor(Math.sqrt(xp / 50)) + 1;
  return Math.min(rawLevel, MAX_LEVEL);
}

/**
 * Get the minimum XP required for a given level
 */
export function getXPForLevel(level: number): number {
  const clampedLevel = Math.max(1, Math.min(level, MAX_LEVEL));
  return LEVEL_THRESHOLDS[clampedLevel] ?? 0;
}

/**
 * Get complete level information for a given XP amount
 */
export function getLevelInfo(xp: number): LevelInfo {
  const currentXP = Math.max(0, xp);
  const level = calculateLevel(currentXP);
  const isMaxLevel = level >= MAX_LEVEL;

  const xpForCurrentLevel = getXPForLevel(level);
  const xpForNextLevel = isMaxLevel ? null : getXPForLevel(level + 1);

  const xpProgress = currentXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel !== null ? xpForNextLevel - currentXP : 0;

  let progressPercent = 0;
  if (!isMaxLevel && xpForNextLevel !== null) {
    const levelRange = xpForNextLevel - xpForCurrentLevel;
    progressPercent = levelRange > 0 ? Math.min(100, (xpProgress / levelRange) * 100) : 100;
  } else {
    progressPercent = 100;
  }

  return {
    level,
    levelName: LEVEL_NAMES[level] ?? 'Nivel ' + level,
    currentXP,
    xpForCurrentLevel,
    xpForNextLevel,
    xpProgress,
    xpNeeded,
    progressPercent: Math.round(progressPercent),
    isMaxLevel,
  };
}
