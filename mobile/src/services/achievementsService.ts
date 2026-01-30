import { apiClient } from './apiClient';

/**
 * Achievement/Badge type
 */
export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  xpReward: number;
  icon: string;
  category: 'streak' | 'tasks' | 'projects' | 'checkins' | 'special';
}

/**
 * User's unlocked achievement with unlock timestamp
 */
export interface UserAchievement {
  id: string;
  achievementId: string;
  userId: string;
  unlockedAt: string;
  achievement: Achievement;
}

/**
 * Response for GET /achievements/me
 */
export interface MyAchievementsResponse {
  achievements: UserAchievement[];
  totalXPFromAchievements: number;
}

/**
 * Response for GET /achievements
 */
export interface AllAchievementsResponse {
  achievements: Achievement[];
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error && 'response' in error) {
    const anyError = error as { response?: { data?: { error?: string } } };
    return anyError.response?.data?.error ?? 'Request failed';
  }
  return 'Request failed';
}

/**
 * Get all unlocked achievements for the current user
 */
export async function getMyAchievements(): Promise<MyAchievementsResponse> {
  try {
    const res = await apiClient.get<MyAchievementsResponse>('/achievements/me');
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get all available achievements in the system
 */
export async function getAllAchievements(): Promise<AllAchievementsResponse> {
  try {
    const res = await apiClient.get<AllAchievementsResponse>('/achievements');
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export const achievementsService = {
  getMyAchievements,
  getAllAchievements,
};
