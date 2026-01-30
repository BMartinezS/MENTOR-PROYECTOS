import { AuthUser, Checkin, PlanIteration, ProjectDetail, Task, WeeklyReview } from './models';

type MockStore = {
  user: AuthUser;
  token: string;
  projects: ProjectDetail[];
  tasksById: Record<string, Task>;
  checkins: Checkin[];
  weeklyReviewsByProjectId: Record<string, WeeklyReview>;
  planIterationsByProjectId: Record<string, PlanIteration[]>;
};

let idCounter = 1;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function createInitialMockStore(): MockStore {
  const user: AuthUser = {
    id: 'user_1',
    email: 'demo@mentor.app',
    name: 'Demo',
    tier: 'free',
    timezone: 'America/Santiago',
    createdAt: new Date().toISOString(),
    expoPushToken: null,
    notificationPreferences: {
      dailyReminders: true,
      progressReminders: true,
      weeklyReview: true,
      deadlineAlerts: true,
      teamNotifications: true,
      reminderTime: '09:00',
    },
  };

  const projectId = 'project_1';
  const tasks: Task[] = [
    {
      id: 'task_1',
      projectId,
      phaseId: 'phase_1',
      title: 'Definir objetivo del proyecto',
      description: 'Escribe en una frase qué significa “listo”.',
      status: 'pending',
      priority: 'high',
      estimatedHours: 1,
      dueDate: todayISO(),
      checklist: [
        { id: 'task_1_check_1', label: 'Hablar con usuarios', completed: false },
        { id: 'task_1_check_2', label: 'Redactar hipótesis SMART', completed: false },
      ],
      metrics: { impact: 'high', effort: 2, focusBlocks: 2, confidence: 60 },
    },
    {
      id: 'task_2',
      projectId,
      phaseId: 'phase_1',
      title: 'Crear lista de primeras 5 tareas',
      description: 'Desglosa el trabajo inicial en pasos concretos.',
      status: 'pending',
      priority: 'medium',
      estimatedHours: 2,
      checklist: [
        { id: 'task_2_check_1', label: 'Listar riesgos', completed: false },
      ],
      metrics: { impact: 'medium', effort: 3, focusBlocks: 1, confidence: 72 },
    },
  ];

  const project: ProjectDetail = {
    id: projectId,
    title: 'Proyecto demo',
    description: 'Un proyecto de ejemplo para probar el flujo.',
    status: 'active',
    progress: 0,
    targetDate: todayISO(),
    area: 'marketing',
    objectives: ['Tener un plan de 2 semanas', 'Completar el primer entregable'],
    tasks,
    phases: [
      {
        id: 'phase_1',
        name: 'Preparación',
        description: 'Definir y estructurar.',
        milestones: [{ id: 'milestone_1', title: 'Plan inicial', dueDate: todayISO() }],
        tasks,
        order: 0,
      },
    ],
  };

  const tasksById: Record<string, Task> = {};
  for (const task of tasks) {
    tasksById[task.id] = task;
  }

  const checkins: Checkin[] = [
    {
      id: 'checkin_1',
      projectId,
      type: 'daily',
      message: 'Hoy tu foco es: Definir objetivo del proyecto. ¿Lo vas a hacer?',
      createdAt: new Date().toISOString(),
      respondedAt: null,
      Project: { title: project.title },
    },
  ];

  return {
    user,
    token: 'mock-token',
    projects: [project],
    tasksById,
    checkins,
    weeklyReviewsByProjectId: {},
    planIterationsByProjectId: { [projectId]: [] },
  };
}

let store: MockStore | null = null;

export function getMockStore() {
  if (!store) {
    store = createInitialMockStore();
  }
  return store;
}

export function resetMockStore() {
  store = createInitialMockStore();
}

export function mockIds() {
  return { nextId };
}

