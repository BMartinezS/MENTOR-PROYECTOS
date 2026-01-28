import { Megaphone, Boxes, Cog, LineChart, BriefcaseBusiness, Sparkles } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { COLORS, GRADIENTS } from '../../constants/theme';
import { ProjectArea } from '../types/models';

export type ProjectDetailSection = 'objectives' | 'tasks' | 'phases';
export type ProjectCardSection = 'progress' | 'milestone' | 'stats';

export type ProjectAreaConfig = {
  label: string;
  description: string;
  accent: string;
  gradient: string[];
  surface: string;
  icon: LucideIcon;
  detailSectionOrder: ProjectDetailSection[];
  cardSectionOrder: ProjectCardSection[];
};

const configs: Record<ProjectArea, ProjectAreaConfig> = {
  general: {
    label: 'General',
    description: 'Plan base adaptable a cualquier área.',
    accent: COLORS.primary,
    gradient: GRADIENTS.card,
    surface: COLORS.surface,
    icon: Sparkles,
    detailSectionOrder: ['objectives', 'tasks', 'phases'],
    cardSectionOrder: ['progress', 'milestone', 'stats'],
  },
  marketing: {
    label: 'Marketing',
    description: 'Énfasis en hitos y métricas de impacto.',
    accent: '#FB7185',
    gradient: ['#3b0764', '#9d174d'],
    surface: 'rgba(156, 23, 77, 0.35)',
    icon: Megaphone,
    detailSectionOrder: ['objectives', 'phases', 'tasks'],
    cardSectionOrder: ['milestone', 'progress', 'stats'],
  },
  product: {
    label: 'Producto',
    description: 'Iteraciones frecuentes y foco en tareas.',
    accent: '#38BDF8',
    gradient: ['#0f172a', '#1d4ed8'],
    surface: 'rgba(14, 116, 144, 0.35)',
    icon: Boxes,
    detailSectionOrder: ['tasks', 'objectives', 'phases'],
    cardSectionOrder: ['progress', 'stats', 'milestone'],
  },
  operations: {
    label: 'Operaciones',
    description: 'Procesos ordenados y dependencias claras.',
    accent: '#34D399',
    gradient: ['#052e16', '#0f766e'],
    surface: 'rgba(15, 118, 110, 0.35)',
    icon: Cog,
    detailSectionOrder: ['phases', 'tasks', 'objectives'],
    cardSectionOrder: ['stats', 'progress', 'milestone'],
  },
  sales: {
    label: 'Ventas',
    description: 'Pipeline visible y metas agresivas.',
    accent: '#FCD34D',
    gradient: ['#78350f', '#fbbf24'],
    surface: 'rgba(251, 191, 36, 0.25)',
    icon: LineChart,
    detailSectionOrder: ['objectives', 'tasks', 'phases'],
    cardSectionOrder: ['milestone', 'stats', 'progress'],
  },
  finance: {
    label: 'Finanzas',
    description: 'Control de hitos y riesgos.',
    accent: '#C4B5FD',
    gradient: ['#1f2937', '#6d28d9'],
    surface: 'rgba(109, 40, 217, 0.35)',
    icon: BriefcaseBusiness,
    detailSectionOrder: ['phases', 'objectives', 'tasks'],
    cardSectionOrder: ['progress', 'milestone', 'stats'],
  },
};

export function getProjectAreaConfig(area?: ProjectArea | null): ProjectAreaConfig {
  if (!area) return configs.general;
  return configs[area] ?? configs.general;
}

export const PROJECT_AREA_VALUES = Object.keys(configs) as ProjectArea[];
