import { apiClient } from './apiClient';

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  totalTasksCompleted: number;
  totalProjectsCompleted: number;
  totalCheckinsCompleted: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  currentStreak: number;
  totalXP: number;
  rank: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  userRank: number | null;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error && 'response' in error) {
    const anyError = error as { response?: { data?: { error?: string } } };
    return anyError.response?.data?.error ?? 'Request failed';
  }
  return 'Request failed';
}

export async function getMyStats(): Promise<UserStats> {
  try {
    const res = await apiClient.get<UserStats>('/stats/me');
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getLeaderboard(): Promise<LeaderboardResponse> {
  try {
    const res = await apiClient.get<LeaderboardResponse>('/stats/leaderboard');
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export const statsService = {
  getMyStats,
  getLeaderboard,
};
