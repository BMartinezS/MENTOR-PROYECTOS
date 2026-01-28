import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

type Props = {
  label: string;
  value: string;
  icon?: ReactNode;
  accent?: string;
};

export default function HighlightCard({ label, value, icon, accent }: Props) {
  return (
    <View style={[styles.card, { borderColor: accent ?? COLORS.primaryLight }]}> 
      <View style={styles.icon}>{icon}</View>
      <Text variant="headlineSmall" style={styles.value}>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING(2),
    borderWidth: 1,
    ...SHADOWS.card,
    minWidth: 160,
  },
  icon: {
    alignSelf: 'flex-start',
    marginBottom: SPACING(1),
  },
  value: {
    color: COLORS.text,
  },
  label: {
    color: COLORS.textMuted,
  },
});

