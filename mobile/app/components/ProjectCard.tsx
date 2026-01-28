import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Chip, Text } from 'react-native-paper';
import { ArrowRight, Calendar, CheckCircle, Target, TrendingUp } from 'lucide-react-native';

import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { getProjectAreaConfig } from '../config/projectAreas';
import { Project } from '../types/models';
import { useCardAnimation } from '../utils/animationsSimple';

type Props = {
  project: Project;
  onPress?: () => void;
};

type SectionKey = 'progress' | 'milestone' | 'stats';

export default function ProjectCard({ project, onPress }: Props) {
  const progress = Math.max(0, Math.min(1, (project.progress ?? 0) / 100));
  const statusLabelMap: Record<string, string> = {
    active: 'activa',
    paused: 'pausada',
    completed: 'completado',
    cancelled: 'cancelado',
  };
  const statusLabel = statusLabelMap[project.status ?? 'active'] ?? 'activa';
  const { onPressIn, onPressOut, animatedStyle } = useCardAnimation(onPress);
  const areaConfig = getProjectAreaConfig(project.area);
  const accent = areaConfig.accent;
  const AreaIcon = areaConfig.icon;
  const StatusIcon = project.status === 'completed' ? CheckCircle : TrendingUp;
  const daysRemaining = formatDaysRemaining(project.daysRemaining, project.targetDate);

  const renderSection = (section: SectionKey) => {
    if (section === 'progress') {
      return (
        <View key="progress" style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <View style={styles.progressLabelRow}>
              <Target size={16} color={accent} />
              <Text style={styles.progressLabel}>Progreso</Text>
            </View>
            <Text style={styles.progressValue}>{project.progress ?? 0}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressTrack} />
            <View
              style={[
                styles.progressFill,
                { width: `${project.progress ?? 0}%`, backgroundColor: accent },
              ]}
            />
          </View>
          <View style={styles.progressDetails}>
            <View style={styles.progressDetail}>
              <Text style={styles.detailLabel}>Tareas</Text>
              <Text style={styles.detailValue}>
                {project.tasksCompleted || 0} / {project.totalTasks || 0}
              </Text>
            </View>
            <View style={styles.progressDetail}>
              <Text style={styles.detailLabel}>Fase actual</Text>
              <Text style={styles.detailValue}>{project.currentPhase || 'Inicio'}</Text>
            </View>
            <View style={styles.progressDetail}>
              <Text style={styles.detailLabel}>Días restantes</Text>
              <Text style={styles.detailValue}>{daysRemaining ?? '--'}</Text>
            </View>
          </View>
        </View>
      );
    }

    if (section === 'milestone' && project.nextMilestone?.title) {
      return (
        <View key="milestone" style={styles.milestoneSection}>
          <Text style={styles.milestoneLabel}>Próximo hito</Text>
          <Text style={styles.milestoneTitle}>{project.nextMilestone.title}</Text>
          {project.nextMilestone.dueDate ? (
            <Text style={styles.milestoneDate}>Meta: {project.nextMilestone.dueDate}</Text>
          ) : null}
        </View>
      );
    }

    if (section === 'stats') {
      return null;
    }

    return null;
  };

  const orderedSections = areaConfig.cardSectionOrder
    .map((section) => renderSection(section))
    .filter(Boolean);

  return (
    <View style={styles.pressable}>
      <LinearGradient colors={areaConfig.gradient} style={[styles.cardContainer, { borderColor: `${accent}66` }]}>
        <View style={styles.cardSurface}>
          <View style={styles.areaRow}>
            <View style={styles.areaBadge}>
              <AreaIcon size={18} color={accent} />
              <Text style={styles.areaBadgeText}>{areaConfig.label}</Text>
            </View>
            <Chip compact style={styles.areaChip} textStyle={{ color: '#05020f' }}>
              {statusLabel}
            </Chip>
          </View>
          <View style={styles.headerTop}>
            <View style={styles.titleRow}>
              <StatusIcon size={22} color={accent} />
              <View style={styles.titleContainer}>
                <Text style={styles.projectTitle} numberOfLines={1}>
                  {project.title}
                </Text>
                <Text style={styles.progressPercentage}>{project.progress ?? 0}% completado</Text>
              </View>
            </View>
            {project.targetDate ? (
              <View style={styles.urgencyIndicator}>
                <Calendar size={16} color={COLORS.textMuted} />
                <Text style={styles.dateText}>{project.targetDate}</Text>
              </View>
            ) : null}
          </View>
          {project.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {project.description}
            </Text>
          ) : null}

          {orderedSections.length ? <View style={styles.sections}>{orderedSections}</View> : null}

          {onPress ? (
            <View style={styles.actionButtonContainer}>
              <Pressable
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                accessibilityRole="button"
                accessibilityLabel={`Ver detalles del proyecto ${project.title}`}
                style={styles.actionButtonPressable}
              >
                <Animated.View style={[styles.actionButton, animatedStyle]}>
                  <Text style={styles.actionText}>Ver detalles</Text>
                  <ArrowRight size={16} color={accent} />
                </Animated.View>
              </Pressable>
            </View>
          ) : null}
        </View>
      </LinearGradient>
    </View>
  );
}

function formatDaysRemaining(existing?: number | null, targetDate?: string | null) {
  if (typeof existing === 'number') return existing;
  if (!targetDate) return null;
  const target = new Date(targetDate).getTime();
  if (Number.isNaN(target)) return null;
  const today = new Date().setHours(0, 0, 0, 0);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : 0;
}

const styles = StyleSheet.create({
  pressable: {
    marginBottom: SPACING(3),
  },
  cardContainer: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    ...SHADOWS.card,
  },
  cardSurface: {
    borderRadius: RADIUS.lg,
    padding: SPACING(2),
    backgroundColor: COLORS.surfaceGlass,
    gap: SPACING(1.5),
  },
  areaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  areaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.5),
    paddingVertical: SPACING(0.5),
    paddingHorizontal: SPACING(1),
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  areaBadgeText: {
    color: COLORS.text,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  areaChip: {
    backgroundColor: COLORS.secondary,
    height: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING(1),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1),
    flex: 1,
  },
  titleContainer: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  progressPercentage: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  urgencyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.5),
  },
  dateText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  description: {
    color: COLORS.textMuted,
  },
  sections: {
    gap: SPACING(1.5),
  },
  progressSection: {
    gap: SPACING(0.75),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.5),
  },
  progressLabel: {
    color: COLORS.text,
    fontWeight: '600',
  },
  progressValue: {
    color: COLORS.text,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 10,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  progressTrack: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.sm,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING(2),
  },
  progressDetail: {
    flex: 1,
  },
  detailLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  detailValue: {
    color: COLORS.text,
    fontWeight: '600',
  },
  milestoneSection: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: RADIUS.md,
    padding: SPACING(1.5),
    gap: SPACING(0.5),
  },
  milestoneLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  milestoneTitle: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 16,
  },
  milestoneDate: {
    color: COLORS.textMuted,
  },
  actionButtonContainer: {
    marginTop: SPACING(1.5),
  },
  actionButtonPressable: {
    borderRadius: RADIUS.sm,
  },
  actionButton: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingVertical: SPACING(1),
    paddingHorizontal: SPACING(1.5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  actionText: {
    color: COLORS.text,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
