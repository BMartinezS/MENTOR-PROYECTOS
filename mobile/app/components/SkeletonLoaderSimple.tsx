import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, RADIUS, SPACING, MINIMAL_CARD } from '../../constants/theme';
import { useShimmerAnimation } from '../../src/utils/animationsSimple';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

/**
 * Minimalist Skeleton loader
 * - Soft shimmer effect
 * - Rounded corners
 */
function Skeleton({ width = '100%', height = 20, borderRadius = RADIUS.sm, style }: SkeletonProps) {
  const shimmerStyle = useShimmerAnimation();

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        shimmerStyle,
        style,
      ]}
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Skeleton width={40} height={40} borderRadius={RADIUS.md} />
          <View style={styles.titleContent}>
            <Skeleton width="70%" height={18} />
            <Skeleton width="40%" height={14} style={{ marginTop: 6 }} />
          </View>
        </View>
      </View>

      <Skeleton width="100%" height={14} style={{ marginBottom: SPACING(1) }} />
      <Skeleton width="80%" height={14} style={{ marginBottom: SPACING(2) }} />

      <View style={styles.progressSection}>
        <Skeleton width="100%" height={6} borderRadius={RADIUS.full} />
      </View>

      <View style={styles.statsRow}>
        <Skeleton width={80} height={14} />
        <Skeleton width={80} height={14} />
      </View>
    </View>
  );
}

export function CheckinCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.checkinHeader}>
        <Skeleton width={120} height={14} />
      </View>

      <View style={styles.messageRow}>
        <Skeleton width={36} height={36} borderRadius={RADIUS.md} />
        <View style={styles.messageContent}>
          <Skeleton width="100%" height={16} style={{ marginBottom: SPACING(0.5) }} />
          <Skeleton width="70%" height={16} />
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Skeleton width="48%" height={44} borderRadius={RADIUS.md} />
        <Skeleton width="48%" height={44} borderRadius={RADIUS.md} />
      </View>
    </View>
  );
}

interface SkeletonListProps {
  count?: number;
  renderItem?: (index: number) => React.ReactNode;
}

export function SkeletonList({ count = 5, renderItem }: SkeletonListProps) {
  return (
    <View style={{ gap: SPACING(2) }}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index}>
          {renderItem ? renderItem(index) : (
            <View style={styles.listItem}>
              <Skeleton width={44} height={44} borderRadius={RADIUS.full} />
              <View style={styles.listContent}>
                <Skeleton width="70%" height={16} />
                <Skeleton width="50%" height={14} style={{ marginTop: 6 }} />
              </View>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.backgroundAlt,
  },
  card: {
    ...MINIMAL_CARD,
    padding: SPACING(2.5),
    marginBottom: SPACING(2),
  },
  header: {
    marginBottom: SPACING(2),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1.5),
  },
  titleContent: {
    flex: 1,
  },
  progressSection: {
    marginBottom: SPACING(2),
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING(3),
  },
  checkinHeader: {
    marginBottom: SPACING(1.5),
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING(1.5),
    marginBottom: SPACING(2.5),
  },
  messageContent: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(2),
    padding: SPACING(2),
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
  },
  listContent: {
    flex: 1,
  },
});

export default Skeleton;
