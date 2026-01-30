import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Pressable, TextInput as RNTextInput } from 'react-native';
import { Text, Portal, Modal } from 'react-native-paper';
import { RefreshCw, MessageSquare, X, Send } from 'lucide-react-native';

import { COLORS, SPACING, RADIUS, SHADOWS, MINIMAL_CARD, MINIMAL_INPUT } from '../../constants/theme';
import CheckinCard from '../components/CheckinCard';
import EmptyState from '../components/EmptyState';
import Screen from '../components/Screen';
import { CheckinCardSkeleton } from '../components/SkeletonLoaderSimple';
import { api } from '../../src/services/api';
import { Checkin } from '../../src/types/models';

type RespondState = {
  checkin: Checkin;
  completed: boolean;
};

/**
 * Minimalist Check-ins Screen
 * - Clean, airy layout
 * - Subtle shadows
 * - Generous whitespace
 */
export default function CheckinsScreen() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [respondState, setRespondState] = useState<RespondState | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      setError(null);
      const items = await api.checkins.pending();
      setCheckins(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los check-ins');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleRefresh = () => {
    void load(true);
  };

  const openRespond = (checkin: Checkin, completed: boolean) => {
    setNotes('');
    setRespondState({ checkin, completed });
  };

  const submitRespond = async () => {
    if (!respondState) return;

    try {
      setSubmitting(true);
      await api.checkins.respond(respondState.checkin.id, {
        completed: respondState.completed,
        notes: notes.trim() ? notes.trim() : undefined,
      });
      setRespondState(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo responder');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCheckin = ({ item }: { item: Checkin }) => (
    <CheckinCard
      checkin={item}
      onRespond={(completed) => openRespond(item, completed)}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Title Row */}
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.headerTitle}>Check-ins</Text>
          <Text style={styles.headerSubtitle}>
            {checkins.length} pendiente{checkins.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Refresh Button */}
        <Pressable
          onPress={handleRefresh}
          disabled={refreshing}
          style={({ pressed }) => [
            styles.refreshButton,
            pressed && styles.refreshButtonPressed,
            refreshing && styles.refreshButtonDisabled,
          ]}
        >
          <RefreshCw
            size={18}
            color={COLORS.primary}
            style={refreshing ? styles.spinning : undefined}
          />
          <Text style={styles.refreshButtonText}>
            {refreshing ? 'Cargando' : 'Recargar'}
          </Text>
        </Pressable>
      </View>

      {/* Error Banner */}
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoIconWrapper}>
          <MessageSquare size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.infoText}>
          Responde a tus check-ins para mantener el ritmo de tus proyectos
        </Text>
      </View>
    </View>
  );

  return (
    <Screen padded={false}>
      <FlatList
        data={checkins}
        renderItem={renderCheckin}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          loading ? (
            <View style={styles.skeletonContainer}>
              <CheckinCardSkeleton />
              <CheckinCardSkeleton />
              <CheckinCardSkeleton />
            </View>
          ) : (
            <EmptyState
              title="Sin check-ins pendientes"
              description="Estamos preparando el próximo mensaje personalizado."
            />
          )
        }
      />

      {/* Response Modal */}
      <Portal>
        <Modal
          visible={!!respondState}
          onDismiss={() => setRespondState(null)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Responder check-in</Text>
              <Pressable
                onPress={() => setRespondState(null)}
                style={styles.modalCloseButton}
              >
                <X size={20} color={COLORS.textMuted} />
              </Pressable>
            </View>

            {/* Status indicator */}
            <View style={[
              styles.statusIndicator,
              { backgroundColor: respondState?.completed ? `${COLORS.secondary}20` : `${COLORS.danger}15` }
            ]}>
              <Text style={[
                styles.statusText,
                { color: respondState?.completed ? COLORS.secondary : COLORS.danger }
              ]}>
                {respondState?.completed ? 'Sí, lo hice' : 'No pude'}
              </Text>
            </View>

            {/* Notes input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notas (opcional)</Text>
              <RNTextInput
                placeholder="Agrega contexto sobre tu progreso..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                style={styles.notesInput}
                placeholderTextColor={COLORS.textLight}
                textAlignVertical="top"
              />
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setRespondState(null)}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.cancelButtonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={submitRespond}
                disabled={submitting}
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.submitButtonPressed,
                  submitting && styles.submitButtonDisabled,
                ]}
              >
                <Send size={16} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Enviando...' : 'Enviar'}
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
  listContent: {
    paddingHorizontal: SPACING(2.5),
    paddingVertical: SPACING(3),
    paddingBottom: SPACING(4),
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

  // Refresh Button
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.75),
    backgroundColor: `${COLORS.primary}12`,
    paddingVertical: SPACING(1.25),
    paddingHorizontal: SPACING(2),
    borderRadius: RADIUS.full,
  },
  refreshButtonPressed: {
    opacity: 0.8,
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  spinning: {
    opacity: 0.5,
  },

  // Error Banner
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

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1.5),
    backgroundColor: `${COLORS.primary}08`,
    padding: SPACING(2),
    borderRadius: RADIUS.lg,
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.primary}15`,
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

  skeletonContainer: {
    gap: SPACING(2),
  },

  // Modal
  modalContainer: {
    margin: SPACING(3),
  },
  modalContent: {
    ...MINIMAL_CARD,
    padding: SPACING(3),
    gap: SPACING(2.5),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    paddingVertical: SPACING(1),
    paddingHorizontal: SPACING(2),
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    gap: SPACING(1),
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  notesInput: {
    ...MINIMAL_INPUT,
    paddingVertical: SPACING(1.5),
    paddingHorizontal: SPACING(2),
    fontSize: 15,
    color: COLORS.text,
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING(1.5),
    marginTop: SPACING(0.5),
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
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING(0.75),
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING(1.75),
    ...SHADOWS.sm,
  },
  submitButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
