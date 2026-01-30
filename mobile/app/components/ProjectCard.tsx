import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { ArrowRight, Calendar, CheckCircle, Target, TrendingUp } from 'lucide-react-native';

import { COLORS, RADIUS, SHADOWS, SPACING, MINIMAL_CARD } from '../../constants/theme';
import { getProjectAreaConfig } from '../../src/config/projectAreas';
import { Project } from '../../src/types/models';

type Props = {
  project: Project;
  onPress?: () => void;
};

/**
 * Minimalist ProjectCard
 * - Clean white card with subtle shadow
 * - Soft accent colors
 * - Generous whitespace
 */
export default function ProjectCard({ project, onPress }: Props) {
  const statusLabelMap: Record<string, string> = {
    active: 'Activo',
    paused: 'Pausado',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };
  const statusLabel = statusLabelMap[project.status ?? 'active'] ?? 'Activo';
  const areaConfig = getProjectAreaConfig(project.area);
  const accent = areaConfig.accent;
  const AreaIcon = areaConfig.icon;
  const StatusIcon = project.status === 'completed' ? CheckCircle : TrendingUp;
  const daysRemaining = formatDaysRemaining(project.daysRemaining, project.targetDate);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconWrapper, { backgroundColor: `${accent}15` }]}>
            <AreaIcon size={18} color={accent} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.projectTitle} numberOfLines={1}>
              {project.title}
            </Text>
            <Text style={styles.areaLabel}>{areaConfig.label}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${accent}15` }]}>
          <Text style={[styles.statusText, { color: accent }]}>{statusLabel}</Text>
        </View>
      </View>

      {/* Description */}
      {project.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {project.description}
        </Text>
      ) : null}

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progreso</Text>
          <Text style={styles.progressValue}>{project.progress ?? 0}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressFill,
              { width: `${project.progress ?? 0}%`, backgroundColor: accent },
            ]}
          />
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Target size={14} color={COLORS.textMuted} />
          <Text style={styles.statText}>
            {project.tasksCompleted || 0}/{project.totalTasks || 0} tareas
          </Text>
        </View>
        {project.targetDate ? (
          <View style={styles.stat}>
            <Calendar size={14} color={COLORS.textMuted} />
            <Text style={styles.statText}>
              {daysRemaining !== null ? `${daysRemaining} días` : project.targetDate}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Action hint */}
      {onPress && (
        <View style={styles.actionHint}>
          <Text style={styles.actionText}>Ver detalles</Text>
          <ArrowRight size={16} color={COLORS.primary} />
        </View>
      )}
    </Pressable>
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
  card: {
    ...MINIMAL_CARD,
    padding: SPACING(2.5),
    marginBottom: SPACING(2),
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING(1.5),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING(1.5),
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  areaLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  statusBadge: {
    paddingVertical: SPACING(0.5),
    paddingHorizontal: SPACING(1.5),
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING(2),
  },
  progressSection: {
    marginBottom: SPACING(2),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING(1),
  },
  progressLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  progressValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundAlt,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING(3),
    marginBottom: SPACING(2),
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.5),
  },
  statText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING(0.5),
    paddingTop: SPACING(1.5),
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
