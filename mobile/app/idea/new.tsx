import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Lightbulb, X, Save, Tag } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  MINIMAL_CARD,
  MINIMAL_INPUT,
} from '../../constants/theme';
import Screen from '../components/Screen';
import { ideasService } from '../../src/services/ideasService';

/**
 * New Idea Modal
 * - Title input (required)
 * - Description textarea (optional)
 * - Tags input (comma separated)
 * - Save button
 */
export default function NewIdeaScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('El titulo es requerido');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const tags = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await ideasService.createIdea({
        title: title.trim(),
        description: description.trim() || undefined,
        tags,
      });

      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la idea');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
              onPress={handleClose}
            >
              <X size={20} color={COLORS.textMuted} />
            </Pressable>
            <Text style={styles.headerTitle}>Nueva idea</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconWrapper}>
              <Lightbulb size={32} color={COLORS.warning} />
            </View>
            <Text style={styles.subtitle}>
              Captura tu idea antes de que se escape
            </Text>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Titulo <Text style={styles.required}>*</Text>
              </Text>
              <RNTextInput
                style={styles.input}
                placeholder="Escribe el titulo de tu idea..."
                placeholderTextColor={COLORS.textLight}
                value={title}
                onChangeText={setTitle}
                autoFocus
                maxLength={100}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripcion</Text>
              <RNTextInput
                style={[styles.input, styles.textArea]}
                placeholder="Agrega detalles, contexto o notas sobre tu idea..."
                placeholderTextColor={COLORS.textLight}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={1000}
              />
            </View>

            {/* Tags */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Tag size={14} color={COLORS.textMuted} />
                <Text style={styles.inputLabel}>Etiquetas</Text>
              </View>
              <RNTextInput
                style={styles.input}
                placeholder="negocio, app, marketing (separadas por coma)"
                placeholderTextColor={COLORS.textLight}
                value={tagsInput}
                onChangeText={setTagsInput}
                autoCapitalize="none"
              />
              <Text style={styles.helperText}>
                Separa las etiquetas con comas
              </Text>
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
              saving && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            <Save size={18} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {saving ? 'Guardando...' : 'Guardar idea'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING(3),
    paddingVertical: SPACING(2),
    paddingBottom: SPACING(4),
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING(3),
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressed: {
    opacity: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },

  // Icon
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING(3),
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.warning}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING(1.5),
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Error
  errorBanner: {
    backgroundColor: `${COLORS.danger}12`,
    padding: SPACING(2),
    borderRadius: RADIUS.md,
    marginBottom: SPACING(2),
  },
  errorText: {
    color: COLORS.danger,
    fontWeight: '500',
    fontSize: 14,
  },

  // Form
  form: {
    gap: SPACING(2.5),
    marginBottom: SPACING(3),
  },
  inputGroup: {
    gap: SPACING(0.75),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.75),
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  required: {
    color: COLORS.danger,
  },
  input: {
    ...MINIMAL_INPUT,
    paddingVertical: SPACING(1.75),
    paddingHorizontal: SPACING(2),
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 120,
    paddingTop: SPACING(1.75),
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SPACING(0.25),
  },

  // Save Button
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING(1),
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING(2),
    ...SHADOWS.sm,
  },
  saveButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
