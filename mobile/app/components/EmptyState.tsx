import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Inbox } from 'lucide-react-native';

import { COLORS, SPACING, RADIUS, SHADOWS, BRUTAL_BUTTON_SECONDARY, BORDERS } from '../../constants/theme';

type Props = {
  title: string;
  description?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
};

/**
 * EmptyState with Neo-Brutalist CTA
 * - Clean empty state message
 * - Bold, attention-grabbing CTA button
 */
export default function EmptyState({ title, description, ctaLabel, onCtaPress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Inbox size={32} color={COLORS.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}

      {/* Neo-Brutalist CTA for conversion */}
      {ctaLabel && onCtaPress && (
        <Pressable
          onPress={onCtaPress}
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaButtonPressed,
          ]}
        >
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING(6),
    paddingHorizontal: SPACING(4),
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING(2),
  },
  title: {
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING(0.5),
  },
  description: {
    color: COLORS.textMuted,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING(3),
  },
  // Neo-Brutalist CTA button
  ctaButton: {
    ...BRUTAL_BUTTON_SECONDARY,
    paddingVertical: SPACING(1.5),
    paddingHorizontal: SPACING(4),
  },
  ctaButtonPressed: {
    ...SHADOWS.brutalPressed,
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  ctaText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
