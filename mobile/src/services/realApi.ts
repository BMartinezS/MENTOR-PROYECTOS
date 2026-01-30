import { apiClient } from './apiClient';
import {
  AuthResponse,
  AuthUser,
  Checkin,
  CreatePhaseRequest,
  CreateProjectAiRequest,
  CreateProjectAiResponse,
  CreateProjectRequest,
  CreateTaskRequest,
  DeleteTaskResponse,
  IteratePlanRequest,
  IteratePlanResponse,
  PlanIterationsResponse,
  Project,
  ProjectDetail,
  ProjectsListResponse,
  ReorderPhasesRequest,
  RespondCheckinRequest,
  Task,
  TaskCompleteRequest,
  TaskCompleteResponse,
  TaskUpdateRequest,
  UpdatePhaseRequest,
  WeeklyReview,
  WeeklyReviewAnswersRequest,
} from './models';

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'response' in error) {
    const anyError = error as any;
    return anyError.response?.data?.error ?? 'Request failed';
  }
  return 'Request failed';
}

export const realApi = {
  auth: {
    async login(payload: { email: string; password: string }): Promise<AuthResponse> {
      try {
        const res = await apiClient.post('/auth/login', payload);
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async register(payload: {
      email: string;
      password: string;
      name: string;
      timezone?: string;
    }): Promise<AuthResponse> {
      try {
        const res = await apiClient.post('/auth/register', payload);
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async profile(): Promise<AuthUser> {
      try {
        const res = await apiClient.get('/auth/profile');
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
  },

  projects: {
    async list(): Promise<Project[]> {
      try {
        const res = await apiClient.get<ProjectsListResponse>('/projects');
        return res.data.projects;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async getById(projectId: string): Promise<ProjectDetail> {
      try {
        const res = await apiClient.get<ProjectDetail>(`/projects/${projectId}`);
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async create(payload: CreateProjectRequest): Promise<Project> {
      try {
        const res = await apiClient.post<Project>('/projects', payload);
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async createWithAI(payload: CreateProjectAiRequest): Promise<CreateProjectAiResponse> {
      try {
        const res = await apiClient.post<CreateProjectAiResponse>('/projects/ai-plan', payload);
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async iterations(projectId: string): Promise<PlanIterationsResponse> {
      try {
        const res = await apiClient.get<PlanIterationsResponse>(`/projects/${projectId}/iterations`);
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async iterate(projectId: string, payload: IteratePlanRequest): Promise<IteratePlanResponse> {
      try {
        const res = await apiClient.post<IteratePlanResponse>(`/projects/${projectId}/iterate`, payload);
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async createPhase(projectId: string, payload: CreatePhaseRequest): Promise<ProjectDetail> {
      try {
        const res = await apiClient.post<ProjectDetail>(`/projects/${projectId}/phases`, payload);
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async updatePhase(projectId: string, phaseId: string, payload: UpdatePhaseRequest): Promise<ProjectDetail> {
      try {
        const res = await apiClient.patch<ProjectDetail>(`/projects/${projectId}/phases/${phaseId}`, payload);
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async reorderPhases(projectId: string, payload: ReorderPhasesRequest): Promise<ProjectDetail> {
      try {
        const res = await apiClient.post<ProjectDetail>(`/projects/${projectId}/phases/reorder`, payload);
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
  },

  tasks: {
    async create(projectId: string, payload: CreateTaskRequest): Promise<Task> {
      try {
        const res = await apiClient.post<Task>(`/projects/${projectId}/tasks`, payload);
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async complete(taskId: string, payload: TaskCompleteRequest): Promise<TaskCompleteResponse> {
      try {
        const res = await apiClient.patch<TaskCompleteResponse>(`/tasks/${taskId}/complete`, payload);
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async getById(taskId: string): Promise<Task> {
      try {
        const res = await apiClient.get<Task>(`/tasks/${taskId}`);
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async update(taskId: string, payload: TaskUpdateRequest): Promise<Task> {
      try {
        const res = await apiClient.patch<Task>(`/tasks/${taskId}`, payload);
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async delete(taskId: string): Promise<DeleteTaskResponse> {
      try {
        const res = await apiClient.delete<DeleteTaskResponse>(`/tasks/${taskId}`);
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
  },

  checkins: {
    async pending(): Promise<Checkin[]> {
      try {
        const res = await apiClient.get<{ checkins: Checkin[] }>('/checkins/pending');
        return res.data.checkins;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async respond(checkinId: string, payload: RespondCheckinRequest): Promise<Checkin> {
      try {
        const res = await apiClient.post<{ checkin: Checkin }>(`/checkins/${checkinId}/respond`, payload);
        return res.data.checkin;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
  },

  weeklyReviews: {
    async latest(projectId: string): Promise<WeeklyReview> {
      try {
        const res = await apiClient.get<WeeklyReview>(`/weekly-reviews/${projectId}/latest`);
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async saveAnswers(reviewId: string, payload: WeeklyReviewAnswersRequest): Promise<WeeklyReview> {
      try {
        const res = await apiClient.post<WeeklyReview>(`/weekly-reviews/${reviewId}/answers`, payload);
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
  },

  notifications: {
    async register(payload: { expoPushToken: string }): Promise<{ success: boolean; message: string }> {
      try {
        const res = await apiClient.post('/notifications/register', payload);
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async unregister(): Promise<{ success: boolean; message: string }> {
      try {
        const res = await apiClient.post('/notifications/unregister');
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async getStats(): Promise<{
      hasNotificationsEnabled: boolean;
      activeProjects: number;
      pendingTasks: number;
      urgentTasks: number;
      nextReminderTime: string;
    }> {
      try {
        const res = await apiClient.get('/notifications/stats');
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async getPreferences(): Promise<{
      preferences: {
        dailyReminders: boolean;
        progressReminders: boolean;
        weeklyReview: boolean;
        deadlineAlerts: boolean;
        teamNotifications: boolean;
        reminderTime: string;
      };
      hasDeviceRegistered: boolean;
    }> {
      try {
        const res = await apiClient.get('/notifications/preferences');
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async updatePreferences(payload: {
      dailyReminders?: boolean;
      progressReminders?: boolean;
      weeklyReview?: boolean;
      deadlineAlerts?: boolean;
      teamNotifications?: boolean;
      reminderTime?: string;
    }): Promise<{ success: boolean; message: string }> {
      try {
        const res = await apiClient.put('/notifications/preferences', payload);
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    async sendTest(): Promise<{ success: boolean; message: string }> {
      try {
        const res = await apiClient.post('/notifications/test');
        return res.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
  },
};
