import { useState } from 'react';
import { StyleSheet, View, Pressable, TextInput as RNTextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { Lightbulb, AlertCircle, ChevronRight } from 'lucide-react-native';

import { COLORS, SPACING, RADIUS, MINIMAL_INPUT, SHADOWS } from '../../constants/theme';

export type ReflectionData = {
  learnings?: string;
  blockers?: string;
};

type ReflectionPromptProps = {
  onSubmit: (reflection: ReflectionData) => void;
  onSkip: () => void;
  submitting?: boolean;
};

/**
 * ReflectionPrompt - Optional reflection fields after check-in response
 *
 * Minimalist, non-intrusive design that encourages but doesn't require
 * the user to reflect on their progress.
 */
export default function ReflectionPrompt({ onSubmit, onSkip, submitting = false }: ReflectionPromptProps) {
  const [learnings, setLearnings] = useState('');
  const [blockers, setBlockers] = useState('');

  const hasContent = learnings.trim() || blockers.trim();

  const handleSubmit = () => {
    if (!hasContent) {
      onSkip();
      return;
    }
    onSubmit({
      learnings: learnings.trim() || undefined,
      blockers: blockers.trim() || undefined,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Momento de reflexion</Text>
        <Text style={styles.subtitle}>Opcional - ayuda a mejorar tu progreso</Text>
      </View>

      {/* Learnings Field */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <View style={styles.iconWrapper}>
            <Lightbulb size={16} color={COLORS.secondary} />
          </View>
          <Text style={styles.inputLabel}>Que aprendiste hoy?</Text>
        </View>
        <RNTextInput
          placeholder="Un insight, algo nuevo, una realizacion..."
          value={learnings}
          onChangeText={setLearnings}
          multiline
          numberOfLines={2}
          style={styles.textInput}
          placeholderTextColor={COLORS.textLight}
          textAlignVertical="top"
          editable={!submitting}
        />
      </View>

      {/* Blockers Field */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <View style={[styles.iconWrapper, styles.iconWrapperWarning]}>
            <AlertCircle size={16} color={COLORS.warning} />
          </View>
          <Text style={styles.inputLabel}>Que te bloqueo?</Text>
        </View>
        <RNTextInput
          placeholder="Obstaculos, distracciones, falta de tiempo..."
          value={blockers}
          onChangeText={setBlockers}
          multiline
          numberOfLines={2}
          style={styles.textInput}
          placeholderTextColor={COLORS.textLight}
          textAlignVertical="top"
          editable={!submitting}
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={onSkip}
          disabled={submitting}
          style={({ pressed }) => [
            styles.skipButton,
            pressed && styles.skipButtonPressed,
            submitting && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.skipButtonText}>Saltar</Text>
          <ChevronRight size={16} color={COLORS.textMuted} />
        </Pressable>

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={({ pressed }) => [
            styles.submitButton,
            !hasContent && styles.submitButtonMuted,
            pressed && styles.submitButtonPressed,
            submitting && styles.buttonDisabled,
          ]}
        >
          <Text style={[styles.submitButtonText, !hasContent && styles.submitButtonTextMuted]}>
            {submitting ? 'Guardando...' : hasContent ? 'Guardar reflexion' : 'Continuar'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING(2.5),
  },
  header: {
    gap: SPACING(0.5),
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  inputGroup: {
    gap: SPACING(1),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1),
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    backgroundColor: `${COLORS.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperWarning: {
    backgroundColor: `${COLORS.warning}20`,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  textInput: {
    ...MINIMAL_INPUT,
    paddingVertical: SPACING(1.5),
    paddingHorizontal: SPACING(2),
    fontSize: 15,
    color: COLORS.text,
    minHeight: 72,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING(1.5),
    marginTop: SPACING(0.5),
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING(0.5),
    paddingVertical: SPACING(1.5),
    paddingHorizontal: SPACING(2),
    borderRadius: RADIUS.md,
    backgroundColor: 'transparent',
  },
  skipButtonPressed: {
    opacity: 0.7,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  submitButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING(1.75),
    paddingHorizontal: SPACING(2),
    ...SHADOWS.sm,
  },
  submitButtonMuted: {
    backgroundColor: COLORS.backgroundAlt,
    ...SHADOWS.none,
  },
  submitButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitButtonTextMuted: {
    color: COLORS.textMuted,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
