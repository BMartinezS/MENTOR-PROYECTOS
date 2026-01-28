import {
  AuthResponse,
  AuthUser,
  Checkin,
  CreatePhaseRequest,
  CreateProjectAiRequest,
  CreateProjectAiResponse,
  CreateProjectRequest,
  IteratePlanRequest,
  IteratePlanResponse,
  PlanIteration,
  PlanIterationsResponse,
  Project,
  ProjectArea,
  ProjectDetail,
  ReorderPhasesRequest,
  RespondCheckinRequest,
  Task,
  TaskCompleteRequest,
  TaskCompleteResponse,
  TaskUpdateRequest,
  UpdatePhaseRequest,
  WeeklyReview,
  WeeklyReviewAnswersRequest,
} from '../types/models';

import { getMockStore, mockIds } from './mockStore';

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requireAuth() {
  const store = getMockStore();
  if (!store.token) {
    throw new Error('No token provided');
  }
  return store;
}

function getProjectOrThrow(store: ReturnType<typeof getMockStore>, projectId: string) {
  const project = store.projects.find((p) => p.id === projectId);
  if (!project) throw new Error('Project not found');
  return project;
}

function ensureIterations(store: ReturnType<typeof getMockStore>, projectId: string) {
  if (!store.planIterationsByProjectId[projectId]) {
    store.planIterationsByProjectId[projectId] = [];
  }
  return store.planIterationsByProjectId[projectId];
}

function inferAreaFromText(text?: string | null): ProjectArea {
  if (!text) return 'general';
  const normalized = text.toLowerCase();
  if (normalized.includes('marketing') || normalized.includes('ads') || normalized.includes('campaña')) {
    return 'marketing';
  }
  if (normalized.includes('producto') || normalized.includes('app') || normalized.includes('mvp')) {
    return 'product';
  }
  if (normalized.includes('operac') || normalized.includes('logística') || normalized.includes('procesos')) {
    return 'operations';
  }
  if (normalized.includes('ventas') || normalized.includes('pipeline') || normalized.includes('comercial')) {
    return 'sales';
  }
  if (normalized.includes('finanzas') || normalized.includes('costos') || normalized.includes('cash')) {
    return 'finance';
  }
  return 'general';
}

function computeDaysRemaining(targetDate?: string | null) {
  if (!targetDate) return '--';
  const target = new Date(targetDate).getTime();
  if (Number.isNaN(target)) return '--';
  const today = new Date().setHours(0, 0, 0, 0);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : 0;
}function computeProjectProgress(project: ProjectDetail) {
  const tasks = project.tasks ?? [];
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
}

function toProjectSummary(project: ProjectDetail): Project {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status as any,
    progress: computeProjectProgress(project),
    targetDate: project.targetDate,
    area: project.area ?? 'general',
    tasksCompleted: project.tasks?.filter((t) => t.status === 'completed').length ?? 0,
    totalTasks: project.tasks?.length ?? 0,
    currentPhase: project.phases?.[0]?.name ?? null,
    daysRemaining: computeDaysRemaining(project.targetDate),
    priority: project.tasks?.some((t) => t.priority === 'high') ? 'high' : 'medium',
    teamSize: 1,
    nextMilestone: project.phases?.[0]?.milestones?.[0]
      ? {
          title: project.phases[0].milestones[0].title,
          dueDate: project.phases[0].milestones[0].dueDate,
        }
      : undefined,
  };
}

export const mockApi = {
  auth: {
    async login(payload: { email: string; password: string }): Promise<AuthResponse> {
      await delay();
      const store = getMockStore();

      if (!payload.email) throw new Error('Email requerido');
      if (!payload.password) throw new Error('Password requerido');

      store.user = { ...store.user, email: payload.email };
      store.token = 'mock-token';
      return { user: store.user, token: store.token };
    },

    async register(payload: {
      email: string;
      password: string;
      name: string;
      timezone?: string;
    }): Promise<AuthResponse> {
      await delay();
      const store = getMockStore();

      if (!payload.email) throw new Error('Email requerido');
      if (!payload.password) throw new Error('Password requerido');
      if (!payload.name) throw new Error('Nombre requerido');

      store.user = {
        ...store.user,
        email: payload.email,
        name: payload.name,
        timezone: payload.timezone ?? store.user.timezone,
      };
      store.token = 'mock-token';

      return { user: store.user, token: store.token };
    },

    async profile(): Promise<AuthUser> {
      await delay(150);
      const store = requireAuth();
      return store.user;
    },
  },

  projects: {
    async list(): Promise<Project[]> {
      await delay();
      const store = requireAuth();
      return store.projects.map(toProjectSummary);
    },

    async getById(projectId: string): Promise<ProjectDetail> {
      await delay();
      const store = requireAuth();
      const project = store.projects.find((p) => p.id === projectId);
      if (!project) throw new Error('Project not found');

      const progress = computeProjectProgress(project);
      return { ...project, progress };
    },

    async create(payload: CreateProjectRequest): Promise<Project> {
      await delay();
      const store = requireAuth();
      const { nextId } = mockIds();

      if (!payload.title?.trim()) throw new Error('Título requerido');

      const id = nextId('project');
      const project: ProjectDetail = {
        id,
        title: payload.title.trim(),
        description: payload.description ?? null,
        status: 'active',
        progress: 0,
        targetDate: payload.targetDate ?? null,
        area: inferAreaFromText(payload.description ?? payload.title),
        objectives: [],
        phases: [],
        tasks: [],
      };
      store.projects.unshift(project);
      store.planIterationsByProjectId[project.id] = [];
      return toProjectSummary(project);
    },

    async createWithAI(payload: CreateProjectAiRequest): Promise<CreateProjectAiResponse> {
      await delay(600);
      const store = requireAuth();
      const { nextId } = mockIds();

      if (!payload.idea?.trim()) throw new Error('Idea requerida');
      if (!payload.targetDate?.trim()) throw new Error('TargetDate requerido');

      const projectId = nextId('project');
      const phaseOneId = nextId('phase');
      const phaseTwoId = nextId('phase');

      const tasks: Task[] = Array.from({ length: 6 }).map((_, idx) => ({
        id: nextId('task'),
        projectId,
        phaseId: idx < 3 ? phaseOneId : phaseTwoId,
        title: `Tarea ${idx + 1}: Paso concreto`,
        description: `Acción específica para avanzar en “${payload.idea.trim().slice(0, 40)}...”`,
        status: 'pending',
        priority: idx < 2 ? 'high' : 'medium',
        estimatedHours: Math.min(2, payload.availableHoursPerWeek),
        dueDate: payload.targetDate,
      }));

      for (const task of tasks) {
        store.tasksById[task.id] = task;
      }

      const project: ProjectDetail = {
        id: projectId,
        title: `Plan: ${payload.idea.trim().slice(0, 40)}`,
        description: payload.idea.trim(),
        status: 'active',
        progress: 0,
        targetDate: payload.targetDate,
        area: inferAreaFromText(payload.idea),
        objectives: ['Objetivo 1', 'Objetivo 2', 'Objetivo 3'],
        phases: [
          {
            id: phaseOneId,
            name: 'Fase 1',
            description: 'Primera fase del plan',
            milestones: [
              {
                id: nextId('milestone'),
                title: 'Primer hito medible',
                dueDate: payload.targetDate,
              },
            ],
            tasks: tasks.slice(0, 3),
          },
          {
            id: phaseTwoId,
            name: 'Fase 2',
            description: 'Segunda fase del plan',
            milestones: [
              {
                id: nextId('milestone'),
                title: 'Segundo hito medible',
                dueDate: payload.targetDate,
              },
            ],
            tasks: tasks.slice(3),
          },
        ],
        tasks,
      };

      store.projects.unshift(project);
      store.checkins.unshift({
        id: nextId('checkin'),
        projectId: project.id,
        type: 'daily',
        message: `¡Vamos! Tu próximo paso es: ${tasks[0].title}. ¿Lo harás hoy?`,
        createdAt: new Date().toISOString(),
        respondedAt: null,
        Project: { title: project.title },
      });

      store.planIterationsByProjectId[project.id] = [];
      return {
        ...project,
        project: toProjectSummary(project),
        plan: {
          objectives: project.objectives,
          phases: project.phases,
          initialTasks: tasks.slice(0, 5),
        },
      };
    },

    async iterations(projectId: string): Promise<PlanIterationsResponse> {
      await delay(200);
      const store = requireAuth();
      const iterations = ensureIterations(store, projectId);
      return { iterations: [...iterations] };
    },

    async iterate(projectId: string, payload: IteratePlanRequest): Promise<IteratePlanResponse> {
      await delay(600);
      const store = requireAuth();
      const project = getProjectOrThrow(store, projectId);
      const iterations = ensureIterations(store, projectId);

      if (!payload.feedback?.trim()) {
        throw new Error('Comparte qué quieres cambiar del plan');
      }
      if (store.user.tier !== 'pro' && iterations.length >= 1) {
        throw new Error('Solo puedes iterar una vez en el plan Free. Mejora a Pro para más iteraciones.');
      }

      const { nextId } = mockIds();
      const feedback = payload.feedback.trim();
      const primaryPhase = project.phases?.[0];
      const newTask: Task = {
        id: nextId('task'),
        projectId,
        phaseId: primaryPhase?.id,
        title: `Nueva apuesta: ${feedback.slice(0, 32)}`,
        description: `Acción derivada del feedback: ${feedback}`,
        status: 'pending',
        priority: 'high',
        estimatedHours: 2,
      };

      store.tasksById[newTask.id] = newTask;
      project.tasks = [newTask, ...(project.tasks ?? [])];
      if (primaryPhase) {
        primaryPhase.tasks = [newTask, ...(primaryPhase.tasks ?? [])];
      }

      project.objectives = [`Ajuste: ${feedback.slice(0, 40)}`, ...(project.objectives ?? [])].slice(0, 4);
      project.progress = computeProjectProgress(project);

      const iteration: PlanIteration = {
        id: nextId('iteration'),
        projectId,
        feedback,
        createdAt: new Date().toISOString(),
        summary: `Iteración enfocada en "${feedback.slice(0, 24)}"`,
        highlights: [
          'Nueva tarea prioritaria añadida al inicio.',
          `Objetivos ahora priorizan: ${feedback.slice(0, 24)}...`,
        ],
        planSnapshot: {
          objectives: project.objectives?.slice(0, 3),
          phases: (project.phases ?? [])
            .slice(0, 2)
            .map(({ id, name, description, milestones }) => ({ id, name, description, milestones })),
        },
      };

      iterations.unshift(iteration);

      return {
        project: { ...project },
        iteration,
        iterations: [...iterations],
        limitReached: store.user.tier !== 'pro' && iterations.length >= 1,
      };
    },

    async createPhase(projectId: string, payload: CreatePhaseRequest): Promise<ProjectDetail> {
      await delay(300);
      const store = requireAuth();
      const project = getProjectOrThrow(store, projectId);
      if (!payload.name?.trim()) throw new Error('Nombre requerido');
      const { nextId } = mockIds();

      const phase = {
        id: nextId('phase'),
        name: payload.name.trim(),
        description: payload.description ?? null,
        milestones: [],
        tasks: [],
        order: project.phases?.length ?? 0,
      };

      if (!project.phases) project.phases = [];
      if (typeof payload.position === 'number' && payload.position >= 0 && payload.position <= project.phases.length) {
        project.phases.splice(payload.position, 0, phase);
      } else {
        project.phases.push(phase);
      }

      return { ...project };
    },

    async updatePhase(projectId: string, phaseId: string, payload: UpdatePhaseRequest): Promise<ProjectDetail> {
      await delay(250);
      const store = requireAuth();
      const project = getProjectOrThrow(store, projectId);
      const phase = project.phases?.find((p) => p.id === phaseId);
      if (!phase) throw new Error('Phase not found');

      if (typeof payload.name === 'string') {
        phase.name = payload.name.trim();
      }
      if (payload.description !== undefined) {
        phase.description = payload.description;
      }

      return { ...project };
    },

    async reorderPhases(projectId: string, payload: ReorderPhasesRequest): Promise<ProjectDetail> {
      await delay(250);
      const store = requireAuth();
      const project = getProjectOrThrow(store, projectId);
      const existingIds = new Set((project.phases ?? []).map((p) => p.id));
      for (const id of payload.orderedPhaseIds) {
        if (!existingIds.has(id)) {
          throw new Error('Orden inválido');
        }
      }

      const ordered = payload.orderedPhaseIds
        .map((id) => project.phases?.find((p) => p.id === id))
        .filter((p): p is Exclude<typeof p, undefined> => Boolean(p));
      if (ordered.length === (project.phases?.length ?? 0)) {
        project.phases = ordered;
      }
      return { ...project };
    },
  },

  tasks: {
    async getById(taskId: string): Promise<Task> {
      await delay();
      const store = requireAuth();
      const task = store.tasksById[taskId];
      if (!task) throw new Error('Task not found');
      return task;
    },

    async complete(taskId: string, payload: TaskCompleteRequest): Promise<TaskCompleteResponse> {
      await delay(400);
      const store = requireAuth();
      const task = store.tasksById[taskId];
      if (!task) throw new Error('Task not found');

      store.tasksById[taskId] = { ...task, status: 'completed' };

      syncTaskInProjects(store, store.tasksById[taskId]);

      return {
        task: {
          id: taskId,
          status: 'completed',
          completedAt: new Date().toISOString(),
        },
        progressLog: {
          id: `progress_${taskId}`,
          notes: payload.notes,
          evidenceUrl: payload.evidenceUrl,
        },
      };
    },

    async update(taskId: string, payload: TaskUpdateRequest): Promise<Task> {
      await delay(250);
      const store = requireAuth();
      const task = store.tasksById[taskId];
      if (!task) throw new Error('Task not found');

      const updated: Task = {
        ...task,
        title: payload.title ?? task.title,
        description: payload.description ?? task.description,
        status: payload.status ?? task.status,
        priority: payload.priority ?? task.priority,
        dueDate: payload.dueDate !== undefined ? payload.dueDate : task.dueDate,
      };

      if (payload.phaseId !== undefined && payload.phaseId !== task.phaseId) {
        updated.phaseId = payload.phaseId ?? null;
      }

      if (payload.checklistUpdates?.length && updated.checklist) {
        updated.checklist = updated.checklist.map((item) => {
          const incoming = payload.checklistUpdates?.find((u) => u.id === item.id);
          if (!incoming) return item;
          return { ...item, completed: incoming.completed };
        });
      }

      store.tasksById[taskId] = updated;
      syncTaskInProjects(store, updated, payload.reorderDirection);

      return updated;
    },
  },

  checkins: {
    async pending(): Promise<Checkin[]> {
      await delay();
      const store = requireAuth();
      return store.checkins.filter((c) => !c.respondedAt);
    },

    async respond(checkinId: string, payload: RespondCheckinRequest): Promise<Checkin> {
      await delay(250);
      const store = requireAuth();
      const idx = store.checkins.findIndex((c) => c.id === checkinId);
      if (idx === -1) throw new Error('Checkin not found');

      const updated: Checkin = {
        ...store.checkins[idx],
        respondedAt: new Date().toISOString(),
        response: {
          completed: payload.completed,
          notes: payload.notes,
          blockedReason: payload.blockedReason ?? null,
        },
      };

      store.checkins[idx] = updated;
      return updated;
    },
  },

  weeklyReviews: {
    async latest(projectId: string): Promise<WeeklyReview> {
      await delay(500);
      const store = requireAuth();

      const existing = store.weeklyReviewsByProjectId[projectId];
      if (existing) return existing;

      const project = store.projects.find((p) => p.id === projectId);
      if (!project) throw new Error('Project not found');

      const tasks = project.tasks ?? [];
      const completed = tasks.filter((t) => t.status === 'completed').length;
      const pending = tasks.filter((t) => t.status !== 'completed').length;

      const review: WeeklyReview = {
        id: `review_${projectId}`,
        projectId,
        summary: `Esta semana completaste ${completed} tareas y te quedan ${pending}.`,
        questions: ['¿Qué fue lo más difícil?', '¿Qué harías diferente la próxima semana?'],
        suggestions: ['Reduce el scope de la próxima tarea a 30 minutos.', 'Define un bloque fijo en tu calendario.'],
        userAnswers: null,
      };

      store.weeklyReviewsByProjectId[projectId] = review;
      return review;
    },

    async saveAnswers(reviewId: string, payload: WeeklyReviewAnswersRequest): Promise<WeeklyReview> {
      await delay(250);
      const store = requireAuth();
      const projectId = reviewId.replace('review_', '');
      const existing = store.weeklyReviewsByProjectId[projectId];
      if (!existing) throw new Error('Weekly review not found');

      const updated: WeeklyReview = {
        ...existing,
        userAnswers: payload.answers,
      };
      store.weeklyReviewsByProjectId[projectId] = updated;
      return updated;
    },
  },

  notifications: {
    async register(payload: { expoPushToken: string }): Promise<{ success: boolean; message: string }> {
      await delay(300);
      const store = requireAuth();

      if (!payload.expoPushToken) {
        throw new Error('Expo push token required');
      }

      // Simulate storing the token
      store.user.expoPushToken = payload.expoPushToken;

      return {
        success: true,
        message: 'Device registered successfully',
      };
    },

    async unregister(): Promise<{ success: boolean; message: string }> {
      await delay(200);
      const store = requireAuth();

      // Simulate removing the token
      store.user.expoPushToken = null;

      return {
        success: true,
        message: 'Device unregistered successfully',
      };
    },

    async getStats(): Promise<{
      hasNotificationsEnabled: boolean;
      activeProjects: number;
      pendingTasks: number;
      urgentTasks: number;
      nextReminderTime: string;
    }> {
      await delay(200);
      const store = requireAuth();

      const activeProjects = store.projects.filter(p => p.status === 'active').length;
      const allTasks = store.projects.flatMap(p => p.tasks ?? []);
      const pendingTasks = allTasks.filter(t => t.status !== 'completed').length;

      // Simulate urgent tasks (due today or overdue)
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const urgentTasks = allTasks.filter(t =>
        t.dueDate && new Date(t.dueDate) <= today && t.status !== 'completed'
      ).length;

      return {
        hasNotificationsEnabled: !!store.user.expoPushToken,
        activeProjects,
        pendingTasks,
        urgentTasks,
        nextReminderTime: '09:00',
      };
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
      await delay(150);
      const store = requireAuth();

      // Default preferences
      const defaultPreferences = {
        dailyReminders: true,
        progressReminders: true,
        weeklyReview: true,
        deadlineAlerts: true,
        teamNotifications: true,
        reminderTime: '09:00',
      };

      return {
        preferences: store.user.notificationPreferences || defaultPreferences,
        hasDeviceRegistered: !!store.user.expoPushToken,
      };
    },

    async updatePreferences(payload: {
      dailyReminders?: boolean;
      progressReminders?: boolean;
      weeklyReview?: boolean;
      deadlineAlerts?: boolean;
      teamNotifications?: boolean;
      reminderTime?: string;
    }): Promise<{ success: boolean; message: string }> {
      await delay(250);
      const store = requireAuth();

      // Update user preferences
      store.user.notificationPreferences = {
        ...(store.user.notificationPreferences || {}),
        ...payload,
      };

      return {
        success: true,
        message: 'Notification preferences updated successfully',
      };
    },

    async sendTest(): Promise<{ success: boolean; message: string }> {
      await delay(500);
      const store = requireAuth();

      if (!store.user.expoPushToken) {
        throw new Error('Device not registered for push notifications');
      }

      // Simulate sending test notification
      console.log('🧪 Mock API: Test notification sent');

      return {
        success: true,
        message: 'Test notification sent successfully',
      };
    },
  },
};

function syncTaskInProjects(
  store: ReturnType<typeof getMockStore>,
  updatedTask: Task,
  reorderDirection?: TaskUpdateRequest['reorderDirection']
) {
  for (const project of store.projects) {
    if (project.id !== updatedTask.projectId) continue;
    project.tasks = (project.tasks ?? []).map((t) => (t.id === updatedTask.id ? updatedTask : t));

    if (!project.phases) continue;
    for (const phase of project.phases) {
      const containsTask = phase.tasks?.some((t) => t.id === updatedTask.id);
      if (phase.id === updatedTask.phaseId) {
        if (phase.tasks) {
          if (containsTask) {
            phase.tasks = phase.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
          } else {
            phase.tasks = [updatedTask, ...phase.tasks];
          }
        } else {
          phase.tasks = [updatedTask];
        }
      } else if (containsTask) {
        phase.tasks = phase.tasks?.filter((t) => t.id !== updatedTask.id) ?? [];
      }
    }

    if (reorderDirection && updatedTask.phaseId) {
      reorderTaskWithinPhase(project, updatedTask.phaseId, updatedTask.id, reorderDirection);
    }
  }
}

function reorderTaskWithinPhase(
  project: ProjectDetail,
  phaseId: string,
  taskId: string,
  direction: 'up' | 'down'
) {
  const phase = project.phases?.find((p) => p.id === phaseId);
  if (!phase || !phase.tasks) return;
  const idx = phase.tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return;
  const targetIndex = direction === 'up' ? Math.max(0, idx - 1) : Math.min(phase.tasks.length - 1, idx + 1);
  if (targetIndex === idx) return;
  const [removed] = phase.tasks.splice(idx, 1);
  phase.tasks.splice(targetIndex, 0, removed);
}

