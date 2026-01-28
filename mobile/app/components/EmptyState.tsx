import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { COLORS, SPACING } from '../../constants/theme';

type Props = {
  title: string;
  description?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  icon?: string;
};

export default function EmptyState({ title, description, ctaLabel, onCtaPress, icon }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon ?? '✨'}</Text>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {ctaLabel && onCtaPress ? (
        <Button mode="contained" onPress={onCtaPress}>
          {ctaLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING(4),
    gap: SPACING(1),
  },
  icon: {
    fontSize: 40,
  },
  title: {
    textAlign: 'center',
    color: COLORS.text,
  },
  description: {
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

