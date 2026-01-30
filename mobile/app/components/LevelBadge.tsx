import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Award } from 'lucide-react-native';

import { COLORS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { getLevelInfo } from '../../src/utils/levelUtils';

type Props = {
  totalXP: number;
  compact?: boolean;
  showProgress?: boolean;
};

/**
 * LevelBadge Component
 *
 * Displays the user's current level with progress bar toward next level.
 * Gaming-style design matching XPBadge and StreakBadge.
 */
export default function LevelBadge({ totalXP = 0, compact = false, showProgress = true }: Props) {
  const levelInfo = getLevelInfo(totalXP);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const previousLevelRef = useRef(levelInfo.level);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: levelInfo.progressPercent,
      duration: 600,
      useNativeDriver: false,
    }).start();

    // Pulse animation when leveling up
    if (levelInfo.level > previousLevelRef.current) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    previousLevelRef.current = levelInfo.level;
  }, [levelInfo.level, levelInfo.progressPercent, progressAnim, scaleAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Award size={14} color={COLORS.primary} />
        <Text style={styles.compactText}>Nv. {levelInfo.level}</Text>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        levelInfo.isMaxLevel && styles.containerMaxLevel,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={styles.iconWrapper}>
        <Award size={16} color={COLORS.primary} />
      </View>
      <View style={styles.contentWrapper}>
        <View style={styles.textRow}>
          <Text style={styles.levelLabel}>Nivel</Text>
          <Text style={styles.levelValue}>{levelInfo.level}</Text>
          {levelInfo.isMaxLevel && (
            <View style={styles.maxBadge}>
              <Text style={styles.maxText}>MAX</Text>
            </View>
          )}
        </View>
        {showProgress && !levelInfo.isMaxLevel && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
            <Text style={styles.progressText}>
              {levelInfo.xpNeeded} XP
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    paddingVertical: SPACING(0.75),
    paddingHorizontal: SPACING(1.5),
    borderRadius: RADIUS.full,
    gap: SPACING(0.75),
    ...SHADOWS.sm,
  },
  containerMaxLevel: {
    backgroundColor: `${COLORS.secondary}20`,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.primary}25`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapper: {
    gap: SPACING(0.25),
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING(0.5),
  },
  levelLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  levelValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  maxBadge: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING(0.25),
    paddingHorizontal: SPACING(0.75),
    borderRadius: RADIUS.xs,
    marginLeft: SPACING(0.25),
  },
  maxText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.75),
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: `${COLORS.primary}20`,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    minWidth: 40,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  progressText: {
    color: COLORS.textLight,
    fontSize: 10,
    fontWeight: '600',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.5),
  },
  compactText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});
