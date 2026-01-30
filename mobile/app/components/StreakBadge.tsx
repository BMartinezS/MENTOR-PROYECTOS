import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { COLORS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';

type Props = {
  currentStreak: number;
  longestStreak: number;
  showRecord?: boolean;
};

/**
 * StreakBadge Component
 *
 * Displays the user's current streak with a fire icon.
 * - Highlighted style when streak > 0
 * - Special indicator when current streak is the user's record
 * - Subtle pulse animation when streak increases
 */
export default function StreakBadge({ currentStreak = 0, longestStreak = 0, showRecord = true }: Props) {
  const streak = currentStreak ?? 0;
  const longest = longestStreak ?? 0;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const previousStreakRef = useRef(streak);

  const isRecord = streak > 0 && streak >= longest;
  const hasStreak = streak > 0;

  useEffect(() => {
    // Animate when streak increases
    if (streak > previousStreakRef.current) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
    previousStreakRef.current = streak;
  }, [streak, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        hasStreak && styles.containerActive,
        isRecord && showRecord && styles.containerRecord,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text style={styles.fireIcon}>🔥</Text>
      <Text style={[styles.streakNumber, hasStreak && styles.streakNumberActive]}>
        {streak}
      </Text>
      {isRecord && showRecord && (
        <View style={styles.recordBadge}>
          <Text style={styles.recordText}>MAX</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundAlt,
    paddingVertical: SPACING(0.75),
    paddingHorizontal: SPACING(1.5),
    borderRadius: RADIUS.full,
    gap: SPACING(0.5),
  },
  containerActive: {
    backgroundColor: `${COLORS.warning}20`,
    ...SHADOWS.sm,
  },
  containerRecord: {
    backgroundColor: `${COLORS.primary}15`,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  fireIcon: {
    fontSize: 16,
  },
  streakNumber: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '700',
  },
  streakNumberActive: {
    color: COLORS.text,
  },
  recordBadge: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING(0.25),
    paddingHorizontal: SPACING(0.75),
    borderRadius: RADIUS.xs,
    marginLeft: SPACING(0.25),
  },
  recordText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
