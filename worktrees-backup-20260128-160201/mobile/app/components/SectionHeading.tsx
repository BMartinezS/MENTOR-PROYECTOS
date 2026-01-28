import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { COLORS, SPACING } from '../../constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export default function SectionHeading({ title, subtitle, actionLabel, onActionPress }: Props) {
  return (
    <View style={styles.container}>
      <View>
        <Text variant="titleMedium" style={styles.title}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onActionPress ? (
        <Button compact mode="text" onPress={onActionPress}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING(1),
  },
  title: {
    color: COLORS.text,
  },
  subtitle: {
    color: COLORS.textMuted,
  },
});

