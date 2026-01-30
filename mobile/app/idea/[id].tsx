import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import { Text, Portal, Modal } from 'react-native-paper';
import {
  Lightbulb,
  ArrowLeft,
  Save,
  Tag,
  Archive,
  Rocket,
  Trash2,
  MessageSquare,
  Sparkles,
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

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
import { Idea } from '../../src/types/models';

function formatDate(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Idea Detail Screen
 * - View/edit idea
 * - Promote to Project button
 * - Archive button
 * - AI chat placeholder
 */
export default function IdeaDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Modals
  const [promoteModalVisible, setPromoteModalVisible] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await ideasService.getById(id);
      setIdea(data);
      setTitle(data.title);
      setDescription(data.description ?? '');
      setTagsInput(data.tags.join(', '));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la idea');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    if (!idea || !title.trim()) {
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

      const updated = await ideasService.updateIdea(idea.id, {
        title: title.trim(),
        description: description.trim() || null,
        tags,
      });

      setIdea(updated);
      setIsEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!idea) return;
    try {
      await ideasService.archiveIdea(idea.id);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo archivar');
    }
  };

  const handlePromote = async () => {
    if (!idea) return;
    try {
      setPromoting(true);
      const result = await ideasService.promoteToProject(idea.id);
      setPromoteModalVisible(false);
      router.replace(`/project/${result.project.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo promover');
      setPromoting(false);
    }
  };

  const handleDelete = async () => {
    if (!idea) return;
    try {
      setDeleting(true);
      await ideasService.deleteIdea(idea.id);
      setDeleteModalVisible(false);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar');
      setDeleting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <Screen padded>
        <View style={styles.loadingContainer}>
          <View style={styles.skeletonHeader} />
          <View style={styles.skeletonContent} />
        </View>
      </Screen>
    );
  }

  if (!idea) {
    return (
      <Screen padded>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Idea no encontrada</Text>
          <Pressable style={styles.backLink} onPress={handleBack}>
            <Text style={styles.backLinkText}>Volver a Ideas</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

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
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
              onPress={handleBack}
            >
              <ArrowLeft size={20} color={COLORS.text} />
            </Pressable>
            <View style={styles.headerTitleContainer}>
              <Lightbulb size={18} color={COLORS.warning} />
              <Text style={styles.headerSubtitle}>Idea</Text>
            </View>
            {!isEditing && (
              <Pressable
                style={({ pressed }) => [
                  styles.editButton,
                  pressed && styles.editButtonPressed,
                ]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editButtonText}>Editar</Text>
              </Pressable>
            )}
            {isEditing && (
              <Pressable
                style={({ pressed }) => [
                  styles.saveHeaderButton,
                  pressed && styles.saveHeaderButtonPressed,
                  saving && styles.buttonDisabled,
                ]}
                onPress={handleSave}
                disabled={saving}
              >
                <Save size={16} color="#FFFFFF" />
                <Text style={styles.saveHeaderButtonText}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            {isEditing ? (
              // Edit Mode
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Titulo <Text style={styles.required}>*</Text>
                  </Text>
                  <RNTextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Titulo de la idea"
                    placeholderTextColor={COLORS.textLight}
                    maxLength={100}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Descripcion</Text>
                  <RNTextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Detalles de la idea..."
                    placeholderTextColor={COLORS.textLight}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    maxLength={1000}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Tag size={14} color={COLORS.textMuted} />
                    <Text style={styles.inputLabel}>Etiquetas</Text>
                  </View>
                  <RNTextInput
                    style={styles.input}
                    value={tagsInput}
                    onChangeText={setTagsInput}
                    placeholder="etiqueta1, etiqueta2"
                    placeholderTextColor={COLORS.textLight}
                    autoCapitalize="none"
                  />
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.cancelEditButton,
                    pressed && styles.cancelEditButtonPressed,
                  ]}
                  onPress={() => {
                    setTitle(idea.title);
                    setDescription(idea.description ?? '');
                    setTagsInput(idea.tags.join(', '));
                    setIsEditing(false);
                  }}
                >
                  <Text style={styles.cancelEditButtonText}>Cancelar</Text>
                </Pressable>
              </View>
            ) : (
              // View Mode
              <>
                <Text style={styles.ideaTitle}>{idea.title}</Text>
                <Text style={styles.ideaDate}>
                  Creada el {formatDate(idea.createdAt)}
                </Text>

                {idea.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {idea.tags.map((tag) => (
                      <View key={tag} style={styles.tagChip}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {idea.description && (
                  <View style={styles.descriptionCard}>
                    <Text style={styles.descriptionText}>{idea.description}</Text>
                  </View>
                )}

                {/* AI Chat Placeholder */}
                <View style={styles.aiSection}>
                  <View style={styles.aiHeader}>
                    <View style={styles.aiIconWrapper}>
                      <Sparkles size={18} color={COLORS.tertiary} />
                    </View>
                    <Text style={styles.aiTitle}>Chat con IA</Text>
                  </View>
                  <View style={styles.aiPlaceholder}>
                    <MessageSquare size={24} color={COLORS.textLight} />
                    <Text style={styles.aiPlaceholderText}>
                      Proximamente podras explorar esta idea con ayuda de IA
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsSection}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.promoteButton,
                      pressed && styles.promoteButtonPressed,
                    ]}
                    onPress={() => setPromoteModalVisible(true)}
                  >
                    <Rocket size={18} color="#FFFFFF" />
                    <Text style={styles.promoteButtonText}>Promover a Proyecto</Text>
                  </Pressable>

                  <View style={styles.secondaryActions}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.secondaryButton,
                        pressed && styles.secondaryButtonPressed,
                      ]}
                      onPress={handleArchive}
                    >
                      <Archive size={16} color={COLORS.secondary} />
                      <Text style={[styles.secondaryButtonText, { color: COLORS.secondary }]}>
                        Archivar
                      </Text>
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.secondaryButton,
                        pressed && styles.secondaryButtonPressed,
                      ]}
                      onPress={() => setDeleteModalVisible(true)}
                    >
                      <Trash2 size={16} color={COLORS.danger} />
                      <Text style={[styles.secondaryButtonText, { color: COLORS.danger }]}>
                        Eliminar
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Promote Modal */}
      <Portal>
        <Modal
          visible={promoteModalVisible}
          onDismiss={() => setPromoteModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalIconWrapper}>
              <Rocket size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.modalTitle}>Promover a Proyecto</Text>
            <Text style={styles.modalDescription}>
              Esta idea se convertira en un nuevo proyecto. Podras agregar
              tareas, fases y objetivos.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalCancelButton,
                  pressed && styles.modalCancelButtonPressed,
                ]}
                onPress={() => setPromoteModalVisible(false)}
                disabled={promoting}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalConfirmButton,
                  pressed && styles.modalConfirmButtonPressed,
                  promoting && styles.buttonDisabled,
                ]}
                onPress={handlePromote}
                disabled={promoting}
              >
                <Text style={styles.modalConfirmButtonText}>
                  {promoting ? 'Creando...' : 'Crear proyecto'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* Delete Modal */}
      <Portal>
        <Modal
          visible={deleteModalVisible}
          onDismiss={() => setDeleteModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={[styles.modalIconWrapper, { backgroundColor: `${COLORS.danger}12` }]}>
              <Trash2 size={32} color={COLORS.danger} />
            </View>
            <Text style={styles.modalTitle}>Eliminar idea</Text>
            <Text style={styles.modalDescription}>
              Esta accion no se puede deshacer. Se eliminara permanentemente la
              idea "{idea.title}".
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalCancelButton,
                  pressed && styles.modalCancelButtonPressed,
                ]}
                onPress={() => setDeleteModalVisible(false)}
                disabled={deleting}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalDeleteButton,
                  pressed && styles.modalDeleteButtonPressed,
                  deleting && styles.buttonDisabled,
                ]}
                onPress={handleDelete}
                disabled={deleting}
              >
                <Text style={styles.modalDeleteButtonText}>
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </Portal>
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

  // Loading
  loadingContainer: {
    gap: SPACING(3),
    paddingTop: SPACING(4),
  },
  skeletonHeader: {
    height: 32,
    width: '60%',
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundAlt,
  },
  skeletonContent: {
    height: 200,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.backgroundAlt,
  },

  // Error
  errorContainer: {
    alignItems: 'center',
    paddingTop: SPACING(8),
    gap: SPACING(2),
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  backLink: {
    padding: SPACING(1),
  },
  backLinkText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING(3),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    opacity: 0.8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.75),
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  editButton: {
    paddingVertical: SPACING(1),
    paddingHorizontal: SPACING(2),
  },
  editButtonPressed: {
    opacity: 0.7,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  saveHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.5),
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING(1),
    paddingHorizontal: SPACING(2),
    borderRadius: RADIUS.md,
  },
  saveHeaderButtonPressed: {
    opacity: 0.9,
  },
  saveHeaderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Content
  content: {
    gap: SPACING(2),
  },
  ideaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 32,
  },
  ideaDate: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING(1),
    marginTop: SPACING(1),
  },
  tagChip: {
    backgroundColor: `${COLORS.warning}15`,
    paddingVertical: SPACING(0.5),
    paddingHorizontal: SPACING(1.5),
    borderRadius: RADIUS.full,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warning,
  },
  descriptionCard: {
    ...MINIMAL_CARD,
    padding: SPACING(2.5),
    marginTop: SPACING(1),
  },
  descriptionText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },

  // AI Section
  aiSection: {
    marginTop: SPACING(2),
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1),
    marginBottom: SPACING(1.5),
  },
  aiIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.tertiary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  aiPlaceholder: {
    ...MINIMAL_CARD,
    padding: SPACING(4),
    alignItems: 'center',
    gap: SPACING(1.5),
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aiPlaceholderText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Actions
  actionsSection: {
    marginTop: SPACING(3),
    gap: SPACING(2),
  },
  promoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING(1),
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING(2),
    ...SHADOWS.sm,
  },
  promoteButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  promoteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING(3),
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.75),
    paddingVertical: SPACING(1),
    paddingHorizontal: SPACING(1.5),
  },
  secondaryButtonPressed: {
    opacity: 0.7,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Form (Edit mode)
  form: {
    gap: SPACING(2.5),
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
    minHeight: 150,
    paddingTop: SPACING(1.75),
  },
  cancelEditButton: {
    alignItems: 'center',
    paddingVertical: SPACING(1.5),
  },
  cancelEditButtonPressed: {
    opacity: 0.7,
  },
  cancelEditButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  // Modal
  modalContainer: {
    margin: SPACING(3),
  },
  modalContent: {
    ...MINIMAL_CARD,
    padding: SPACING(3),
    alignItems: 'center',
    gap: SPACING(2),
  },
  modalIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING(1.5),
    marginTop: SPACING(1),
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING(1.75),
    alignItems: 'center',
  },
  modalCancelButtonPressed: {
    opacity: 0.8,
  },
  modalCancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING(1.75),
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  modalConfirmButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  modalConfirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING(1.75),
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  modalDeleteButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  modalDeleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
