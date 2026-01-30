import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
  Animated,
} from 'react-native';
import { Text, Portal, Modal, FAB } from 'react-native-paper';
import {
  Lightbulb,
  Archive,
  Trash2,
  ChevronRight,
  Plus,
  Tag,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';

import { COLORS, SPACING, RADIUS, SHADOWS, MINIMAL_CARD } from '../../constants/theme';
import EmptyState from '../components/EmptyState';
import Screen from '../components/Screen';
import { ideasService } from '../../src/services/ideasService';
import { Idea } from '../../src/types/models';

function formatDate(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Ideas Tab Screen (Idea Backlog)
 * - List of ideas with FlatList
 * - FAB for quick idea creation
 * - Swipe actions: archive, delete
 * - Pull to refresh
 */
export default function IdeasScreen() {
  const router = useRouter();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState<Idea | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await ideasService.getIdeas({ status: 'active' });
      setIdeas(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las ideas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRefresh = useCallback(() => {
    void load(true);
  }, [load]);

  const handleArchive = useCallback(async (idea: Idea) => {
    try {
      await ideasService.archiveIdea(idea.id);
      setIdeas((prev) => prev.filter((i) => i.id !== idea.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo archivar');
    }
  }, []);

  const confirmDelete = useCallback((idea: Idea) => {
    setIdeaToDelete(idea);
    setDeleteModalVisible(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!ideaToDelete) return;
    try {
      setDeleting(true);
      await ideasService.deleteIdea(ideaToDelete.id);
      setIdeas((prev) => prev.filter((i) => i.id !== ideaToDelete.id));
      setDeleteModalVisible(false);
      setIdeaToDelete(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar');
    } finally {
      setDeleting(false);
    }
  }, [ideaToDelete]);

  const renderRightActions = useCallback(
    (
      progress: Animated.AnimatedInterpolation<number>,
      dragX: Animated.AnimatedInterpolation<number>,
      idea: Idea
    ) => {
      const translateX = dragX.interpolate({
        inputRange: [-160, 0],
        outputRange: [0, 160],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View style={[styles.swipeActions, { transform: [{ translateX }] }]}>
          <Pressable
            style={[styles.swipeButton, styles.archiveButton]}
            onPress={() => handleArchive(idea)}
          >
            <Archive size={20} color="#FFFFFF" />
            <Text style={styles.swipeButtonText}>Archivar</Text>
          </Pressable>
          <Pressable
            style={[styles.swipeButton, styles.deleteButton]}
            onPress={() => confirmDelete(idea)}
          >
            <Trash2 size={20} color="#FFFFFF" />
            <Text style={styles.swipeButtonText}>Eliminar</Text>
          </Pressable>
        </Animated.View>
      );
    },
    [handleArchive, confirmDelete]
  );

  const renderIdea = useCallback(
    ({ item }: { item: Idea }) => (
      <Swipeable
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
        overshootRight={false}
        friction={2}
      >
        <Pressable
          style={({ pressed }) => [
            styles.ideaCard,
            pressed && styles.ideaCardPressed,
          ]}
          onPress={() => router.push(`/idea/${item.id}`)}
        >
          <View style={styles.ideaIconWrapper}>
            <Lightbulb size={20} color={COLORS.warning} />
          </View>
          <View style={styles.ideaContent}>
            <Text style={styles.ideaTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.ideaMeta}>
              {item.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  <Tag size={12} color={COLORS.textMuted} />
                  <Text style={styles.tagsText} numberOfLines={1}>
                    {item.tags.slice(0, 3).join(', ')}
                    {item.tags.length > 3 ? ` +${item.tags.length - 3}` : ''}
                  </Text>
                </View>
              )}
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
          <ChevronRight size={18} color={COLORS.textLight} />
        </Pressable>
      </Swipeable>
    ),
    [renderRightActions, router]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.headerTitle}>Ideas</Text>
            <Text style={styles.headerSubtitle}>
              {ideas.length} idea{ideas.length !== 1 ? 's' : ''} guardada
              {ideas.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoIconWrapper}>
            <Lightbulb size={18} color={COLORS.warning} />
          </View>
          <Text style={styles.infoText}>
            Guarda tus ideas y promuevelas a proyectos cuando estes listo
          </Text>
        </View>
      </View>
    ),
    [ideas.length, error]
  );

  const renderSkeleton = useCallback(
    () => (
      <View style={styles.skeletonContainer}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.skeletonCard}>
            <View style={styles.skeletonIcon} />
            <View style={styles.skeletonContent}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonMeta} />
            </View>
          </View>
        ))}
      </View>
    ),
    []
  );

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <Screen padded={false}>
        <FlatList
          data={ideas}
          renderItem={renderIdea}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            loading ? (
              renderSkeleton()
            ) : (
              <EmptyState
                title="No tienes ideas guardadas"
                description="Captura esa chispa de inspiracion antes de que se escape"
                ctaLabel="Agregar idea"
                onCtaPress={() => router.push('/idea/new')}
              />
            )
          }
        />

        <FAB
          icon={() => <Plus size={24} color="#FFFFFF" />}
          style={styles.fab}
          onPress={() => router.push('/idea/new')}
          color="#FFFFFF"
        />

        {/* Delete Confirmation Modal */}
        <Portal>
          <Modal
            visible={deleteModalVisible}
            onDismiss={() => setDeleteModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalIconWrapper}>
                <Trash2 size={32} color={COLORS.danger} />
              </View>
              <Text style={styles.modalTitle}>Eliminar idea</Text>
              <Text style={styles.modalDescription}>
                Esta accion no se puede deshacer. Se eliminara permanentemente la idea
                "{ideaToDelete?.title}".
              </Text>
              <View style={styles.modalActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && styles.cancelButtonPressed,
                  ]}
                  onPress={() => setDeleteModalVisible(false)}
                  disabled={deleting}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteConfirmButton,
                    pressed && styles.deleteConfirmButtonPressed,
                    deleting && styles.buttonDisabled,
                  ]}
                  onPress={handleDelete}
                  disabled={deleting}
                >
                  <Text style={styles.deleteConfirmButtonText}>
                    {deleting ? 'Eliminando...' : 'Eliminar'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </Portal>
      </Screen>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING(2.5),
    paddingVertical: SPACING(3),
    paddingBottom: SPACING(12),
  },
  headerContainer: {
    gap: SPACING(2.5),
    marginBottom: SPACING(2.5),
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: SPACING(0.25),
  },
  errorBanner: {
    backgroundColor: `${COLORS.danger}12`,
    padding: SPACING(2),
    borderRadius: RADIUS.md,
  },
  errorText: {
    color: COLORS.danger,
    fontWeight: '500',
    fontSize: 14,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1.5),
    backgroundColor: `${COLORS.warning}10`,
    padding: SPACING(2),
    borderRadius: RADIUS.lg,
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.warning}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    lineHeight: 20,
  },

  // Idea Card
  ideaCard: {
    ...MINIMAL_CARD,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING(2),
    marginBottom: SPACING(1.5),
    gap: SPACING(1.5),
  },
  ideaCardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
  ideaIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.warning}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ideaContent: {
    flex: 1,
    gap: SPACING(0.5),
  },
  ideaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  ideaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING(1),
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.5),
    flex: 1,
  },
  tagsText: {
    fontSize: 12,
    color: COLORS.textMuted,
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textLight,
  },

  // Swipe Actions
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING(1.5),
  },
  swipeButton: {
    width: 80,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING(0.5),
  },
  archiveButton: {
    backgroundColor: COLORS.secondary,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
    borderTopRightRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
  },
  swipeButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Skeleton
  skeletonContainer: {
    gap: SPACING(1.5),
  },
  skeletonCard: {
    ...MINIMAL_CARD,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING(2),
    gap: SPACING(1.5),
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundAlt,
  },
  skeletonContent: {
    flex: 1,
    gap: SPACING(1),
  },
  skeletonTitle: {
    height: 16,
    width: '70%',
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.backgroundAlt,
  },
  skeletonMeta: {
    height: 12,
    width: '40%',
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.backgroundAlt,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: SPACING(3),
    bottom: SPACING(3),
    backgroundColor: COLORS.primary,
    ...SHADOWS.lg,
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
    backgroundColor: `${COLORS.danger}12`,
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
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING(1.75),
    alignItems: 'center',
  },
  cancelButtonPressed: {
    opacity: 0.8,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING(1.75),
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  deleteConfirmButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  deleteConfirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
