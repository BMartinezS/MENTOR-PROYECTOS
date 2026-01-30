import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Star } from 'lucide-react-native';

import { COLORS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';

type Props = {
  totalXP: number;
  compact?: boolean;
};

/**
 * XPBadge Component
 *
 * Displays total XP with gaming style.
 * Format: "1,250 XP"
 */
export default function XPBadge({ totalXP = 0, compact = false }: Props) {
  // Format number with thousand separators
  const formattedXP = (totalXP ?? 0).toLocaleString('es-ES');

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Star size={14} color={COLORS.secondary} fill={COLORS.secondary} />
        <Text style={styles.compactText}>{formattedXP}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Star size={16} color={COLORS.secondary} fill={COLORS.secondary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.xpValue}>{formattedXP}</Text>
        <Text style={styles.xpLabel}>XP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.secondary}15`,
    paddingVertical: SPACING(0.75),
    paddingHorizontal: SPACING(1.5),
    borderRadius: RADIUS.full,
    gap: SPACING(0.75),
    ...SHADOWS.sm,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.secondary}25`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING(0.25),
  },
  xpValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  xpLabel: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
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
