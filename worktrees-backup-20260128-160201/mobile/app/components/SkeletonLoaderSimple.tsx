import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useShimmerAnimation } from '../utils/animationsSimple';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

// Base skeleton component with shimmer animation
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

// Project card skeleton
export function ProjectCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Skeleton width={20} height={20} borderRadius={10} />
          <Skeleton width="60%" height={20} />
          <Skeleton width={60} height={24} borderRadius={12} />
        </View>
        <View style={styles.metaRow}>
          <Skeleton width={16} height={16} borderRadius={8} />
          <Skeleton width="40%" height={16} />
        </View>
      </View>

      <Skeleton width="100%" height={16} style={{ marginBottom: SPACING(1) }} />
      <Skeleton width="80%" height={16} style={{ marginBottom: SPACING(1) }} />

      <View style={styles.progressRow}>
        <View style={styles.progressLabel}>
          <Skeleton width={16} height={16} borderRadius={8} />
          <Skeleton width={60} height={16} />
        </View>
        <Skeleton width={40} height={16} />
      </View>

      <Skeleton width="100%" height={8} borderRadius={4} style={{ marginVertical: SPACING(1) }} />

      <View style={styles.linkRow}>
        <Skeleton width="50%" height={16} />
        <Skeleton width={16} height={16} borderRadius={8} />
      </View>
    </View>
  );
}

// Checkin card skeleton
export function CheckinCardSkeleton() {
  return (
    <View style={[styles.card, styles.checkinCard]}>
      <View style={styles.checkinHeader}>
        <View style={styles.projectRow}>
          <Skeleton width={16} height={16} borderRadius={8} />
          <Skeleton width="40%" height={14} />
        </View>
        <Skeleton width={20} height={20} borderRadius={10} />
      </View>

      <View style={styles.messageRow}>
        <Skeleton width={20} height={20} borderRadius={10} />
        <View style={styles.messageContent}>
          <Skeleton width="100%" height={18} style={{ marginBottom: SPACING(0.5) }} />
          <Skeleton width="70%" height={18} />
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Skeleton width="48%" height={44} borderRadius={RADIUS.md} />
        <Skeleton width="48%" height={44} borderRadius={RADIUS.md} />
      </View>
    </View>
  );
}

// Simple list skeleton for multiple items
interface SkeletonListProps {
  count?: number;
  itemHeight?: number;
  spacing?: number;
  renderItem?: (index: number) => React.ReactNode;
}

export function SkeletonList({
  count = 5,
  itemHeight = 60,
  spacing = SPACING(1),
  renderItem
}: SkeletonListProps) {
  return (
    <View style={{ gap: spacing }}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index}>
          {renderItem ? renderItem(index) : (
            <View style={styles.listItem}>
              <Skeleton width={40} height={40} borderRadius={20} />
              <View style={styles.listContent}>
                <Skeleton width="70%" height={16} style={{ marginBottom: SPACING(0.5) }} />
                <Skeleton width="50%" height={14} />
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
    backgroundColor: COLORS.surfaceMuted,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING(2),
    marginBottom: SPACING(2),
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    gap: SPACING(1),
  },
  header: {
    gap: SPACING(1),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.5),
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING(1),
  },
  progressLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.5),
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING(1),
  },
  checkinCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  checkinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.5),
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING(1),
  },
  messageContent: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING(1),
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(2),
    padding: SPACING(2),
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
  },
  listContent: {
    flex: 1,
  },
});

export default Skeleton;