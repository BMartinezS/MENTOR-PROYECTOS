import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { ChevronRight } from 'lucide-react-native';

import { COLORS, SPACING } from '../../constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

/**
 * Minimalist SectionHeading
 * - Clean typography
 * - Subtle action link
 */
export default function SectionHeading({ title, subtitle, actionLabel, onActionPress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {actionLabel && onActionPress && (
        <Pressable
          onPress={onActionPress}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
          ]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <ChevronRight size={16} color={COLORS.primary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING(1.5),
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: SPACING(0.25),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.25),
    paddingVertical: SPACING(0.5),
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  actionText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
