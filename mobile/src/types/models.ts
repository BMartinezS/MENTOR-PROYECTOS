export type ProjectArea = 'general' | 'marketing' | 'product' | 'operations' | 'sales' | 'finance';

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  timezone?: string | null;
  tier?: 'free' | 'pro';
  createdAt?: string;
  expoPushToken?: string | null;
  notificationPreferences?: {
    dailyReminders: boolean;
    progressReminders: boolean;
    weeklyReview: boolean;
    deadlineAlerts: boolean;
    teamNotifications: boolean;
    reminderTime: string;
  };
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export type Project = {
  id: string;
  title: string;
  description?: string | null;
  status?: 'active' | 'paused' | 'completed' | 'cancelled';
  progress?: number;
  targetDate?: string | null;
  area?: ProjectArea;
  tasksCompleted?: number;
  totalTasks?: number;
  currentPhase?: string | null;
  daysRemaining?: number | null;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  teamSize?: number;
  nextMilestone?: {
    title: string;
    dueDate?: string | null;
  };
};

export type ProjectsListResponse = {
  projects: Project[];
};

export type Task = {
  id: string;
  projectId: string;
  phaseId?: string | null;
  title: string;
  description?: string | null;
  status?: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority?: 'low' | 'medium' | 'high';
  estimatedHours?: number;
  dueDate?: string | null;
  blockedReason?: string | null;
  checklist?: ChecklistItem[];
  metrics?: TaskMetrics;
  order?: number;
};

export type Phase = {
  id: string;
  name: string;
  description?: string | null;
  milestones?: Milestone[];
  tasks?: Task[];
  order?: number;
};

export type Milestone = {
  id: string;
  title: string;
  dueDate?: string | null;
  completed?: boolean;
};

export type ProjectDetail = {
  id: string;
  title: string;
  description?: string | null;
  status?: string;
  progress?: number;
  targetDate?: string | null;
  area?: ProjectArea;
  objectives?: string[];
  phases?: Phase[];
  tasks?: Task[];
};

export type CreateProjectRequest = {
  title: string;
  description?: string;
  targetDate?: string;
};

export type CreateProjectAiRequest = {
  idea: string;
  availableHoursPerWeek: number;
  targetDate: string;
};

export type CreateProjectAiResponse = {
  project?: Project;
  plan?: {
    objectives?: string[];
    phases?: Phase[];
    initialTasks?: Task[];
  };
} & ProjectDetail;

export type TaskCompleteRequest = {
  notes?: string;
  evidenceUrl?: string;
};

export type TaskCompleteResponse = {
  task: {
    id: string;
    status: string;
    completedAt?: string;
  };
  progressLog?: {
    id: string;
    notes?: string;
    evidenceUrl?: string;
  };
};

export type Checkin = {
  id: string;
  projectId: string;
  type: 'daily' | 'weekly' | 'blocking';
  message: string;
  createdAt?: string;
  respondedAt?: string | null;
  response?: {
    completed?: boolean;
    notes?: string;
    blockedReason?: string | null;
  };
  Project?: {
    title?: string;
  };
};

export type RespondCheckinRequest = {
  completed: boolean;
  notes?: string;
  blockedReason?: string | null;
};

export type WeeklyReview = {
  id: string;
  projectId: string;
  summary?: string | null;
  questions?: string[];
  suggestions?: string[];
  userAnswers?: Record<string, string> | null;
};

export type WeeklyReviewAnswersRequest = {
  answers: Record<string, string>;
};

export type ChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

export type TaskMetrics = {
  focusBlocks?: number;
  impact?: 'low' | 'medium' | 'high';
  effort?: number;
  confidence?: number;
};

export type TaskUpdateRequest = {
  title?: string;
  description?: string | null;
  status?: Task['status'];
  priority?: Task['priority'];
  dueDate?: string | null;
  phaseId?: string | null;
  reorderDirection?: 'up' | 'down';
  checklistUpdates?: { id: string; completed: boolean }[];
};

export type PlanIteration = {
  id: string;
  projectId: string;
  feedback: string;
  createdAt: string;
  summary: string;
  highlights?: string[];
  planSnapshot?: {
    objectives?: string[];
    phases?: Pick<Phase, 'id' | 'name' | 'description' | 'milestones'>[];
  };
};

export type PlanIterationsResponse = {
  iterations: PlanIteration[];
};

export type IteratePlanRequest = {
  feedback: string;
  referenceIterationId?: string | null;
};

export type IteratePlanResponse = {
  project: ProjectDetail;
  iteration: PlanIteration;
  iterations: PlanIteration[];
  limitReached?: boolean;
};

export type CreatePhaseRequest = {
  name: string;
  description?: string;
  position?: number;
};

export type UpdatePhaseRequest = {
  name?: string;
  description?: string | null;
};

export type ReorderPhasesRequest = {
  orderedPhaseIds: string[];
};
