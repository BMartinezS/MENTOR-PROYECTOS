import { apiClient } from './apiClient';
import {
  CreateIdeaRequest,
  Idea,
  IdeasListResponse,
  PromoteIdeaResponse,
  UpdateIdeaRequest,
} from './models';

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'response' in error) {
    const anyError = error as any;
    return anyError.response?.data?.error ?? 'Request failed';
  }
  return 'Request failed';
}

export type IdeasFilter = {
  status?: 'active' | 'archived' | 'promoted';
  tag?: string;
};

export const ideasService = {
  async getIdeas(filters?: IdeasFilter): Promise<Idea[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.tag) {
        params.append('tag', filters.tag);
      }
      const queryString = params.toString();
      const url = queryString ? `/ideas?${queryString}` : '/ideas';
      const res = await apiClient.get<IdeasListResponse>(url);
      return res.data.ideas;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getById(ideaId: string): Promise<Idea> {
    try {
      const res = await apiClient.get<Idea>(`/ideas/${ideaId}`);
      return res.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async createIdea(data: CreateIdeaRequest): Promise<Idea> {
    try {
      const res = await apiClient.post<Idea>('/ideas', data);
      return res.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateIdea(ideaId: string, data: UpdateIdeaRequest): Promise<Idea> {
    try {
      const res = await apiClient.patch<Idea>(`/ideas/${ideaId}`, data);
      return res.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async deleteIdea(ideaId: string): Promise<void> {
    try {
      await apiClient.delete(`/ideas/${ideaId}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async archiveIdea(ideaId: string): Promise<Idea> {
    try {
      const res = await apiClient.post<Idea>(`/ideas/${ideaId}/archive`);
      return res.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async unarchiveIdea(ideaId: string): Promise<Idea> {
    try {
      const res = await apiClient.post<Idea>(`/ideas/${ideaId}/unarchive`);
      return res.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async promoteToProject(ideaId: string): Promise<PromoteIdeaResponse> {
    try {
      const res = await apiClient.post<PromoteIdeaResponse>(`/ideas/${ideaId}/promote`);
      return res.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async reorder(orderedIds: string[]): Promise<Idea[]> {
    try {
      const res = await apiClient.post<IdeasListResponse>('/ideas/reorder', { orderedIds });
      return res.data.ideas;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
