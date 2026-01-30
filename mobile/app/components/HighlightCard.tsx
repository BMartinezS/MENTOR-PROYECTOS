import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { COLORS, RADIUS, SPACING, MINIMAL_CARD } from '../../constants/theme';

type Props = {
  label: string;
  value: string;
  icon?: ReactNode;
  accent?: string;
};

/**
 * Minimalist HighlightCard
 * - Clean stat display
 * - Subtle accent color
 */
export default function HighlightCard({ label, value, icon, accent }: Props) {
  const accentColor = accent ?? COLORS.primary;

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrapper, { backgroundColor: `${accentColor}15` }]}>
        {icon}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    ...MINIMAL_CARD,
    padding: SPACING(2),
    minWidth: 140,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING(1.5),
  },
  value: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
    marginTop: SPACING(0.25),
  },
});
