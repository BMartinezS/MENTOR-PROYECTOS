import { Megaphone, Boxes, Cog, LineChart, BriefcaseBusiness, Sparkles } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { COLORS, BORDERS, SHADOWS } from '../../constants/theme';
import { ProjectArea } from '../types/models';

export type ProjectDetailSection = 'objectives' | 'tasks' | 'phases';
export type ProjectCardSection = 'progress' | 'milestone' | 'stats';

export type ProjectAreaConfig = {
  label: string;
  description: string;
  accent: string;
  background: string;
  icon: LucideIcon;
  detailSectionOrder: ProjectDetailSection[];
  cardSectionOrder: ProjectCardSection[];
};

/**
 * Neo-Brutalist project area configurations
 * - Bold, saturated accent colors
 * - No gradients - solid backgrounds
 * - High contrast for readability
 */
const configs: Record<ProjectArea, ProjectAreaConfig> = {
  general: {
    label: 'General',
    description: 'Plan base adaptable a cualquier area.',
    accent: COLORS.primary,
    background: COLORS.surface,
    icon: Sparkles,
    detailSectionOrder: ['objectives', 'tasks', 'phases'],
    cardSectionOrder: ['progress', 'milestone', 'stats'],
  },
  marketing: {
    label: 'Marketing',
    description: 'Enfasis en hitos y metricas de impacto.',
    accent: '#FF6B6B',
    background: COLORS.surface,
    icon: Megaphone,
    detailSectionOrder: ['objectives', 'phases', 'tasks'],
    cardSectionOrder: ['milestone', 'progress', 'stats'],
  },
  product: {
    label: 'Producto',
    description: 'Iteraciones frecuentes y foco en tareas.',
    accent: '#4ECDC4',
    background: COLORS.surface,
    icon: Boxes,
    detailSectionOrder: ['tasks', 'objectives', 'phases'],
    cardSectionOrder: ['progress', 'stats', 'milestone'],
  },
  operations: {
    label: 'Operaciones',
    description: 'Procesos ordenados y dependencias claras.',
    accent: '#6BCB77',
    background: COLORS.surface,
    icon: Cog,
    detailSectionOrder: ['phases', 'tasks', 'objectives'],
    cardSectionOrder: ['stats', 'progress', 'milestone'],
  },
  sales: {
    label: 'Ventas',
    description: 'Pipeline visible y metas agresivas.',
    accent: '#FFE66D',
    background: COLORS.surface,
    icon: LineChart,
    detailSectionOrder: ['objectives', 'tasks', 'phases'],
    cardSectionOrder: ['milestone', 'stats', 'progress'],
  },
  finance: {
    label: 'Finanzas',
    description: 'Control de hitos y riesgos.',
    accent: '#A06CD5',
    background: COLORS.surface,
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
