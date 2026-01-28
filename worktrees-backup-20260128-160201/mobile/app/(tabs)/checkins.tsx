import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Dialog, HelperText, Portal, Text, TextInput } from 'react-native-paper';

import { COLORS, SPACING } from '../../constants/theme';
import CheckinCard from '../components/CheckinCard';
import EmptyState from '../components/EmptyState';
import Screen from '../components/Screen';
import SectionHeading from '../components/SectionHeading';
import { CheckinCardSkeleton } from '../components/SkeletonLoaderSimple';
import { api } from '../services/api';
import { Checkin } from '../types/models';

type RespondState = {
  checkin: Checkin;
  completed: boolean;
};

export default function CheckinsScreen() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [respondState, setRespondState] = useState<RespondState | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setError(null);
      const items = await api.checkins.pending();
      setCheckins(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los check-ins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

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

  return (
    <Screen>
      <FlatList
        data={checkins}
        renderItem={renderCheckin}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <View style={styles.header}>
            <SectionHeading
              title="Check-ins pendientes"
              subtitle="Mensajes personalizados para mantener el foco"
              actionLabel="Recargar"
              onActionPress={load}
            />
            {error ? <HelperText type="error">{error}</HelperText> : null}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View>
              <CheckinCardSkeleton />
              <CheckinCardSkeleton />
              <CheckinCardSkeleton />
            </View>
          ) : (
            <EmptyState
              title="Sin check-ins pendientes"
              description="Estamos preparando el próximo mensaje personalizado."
              icon="😊"
            />
          )
        }
      />

      <Portal>
        <Dialog visible={!!respondState} onDismiss={() => setRespondState(null)}>
          <Dialog.Title>Responder</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Notas (opcional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRespondState(null)}>Cancelar</Button>
            <Button onPress={submitRespond} loading={submitting} disabled={submitting}>
              Enviar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING(2),
    paddingHorizontal: SPACING(2),
    gap: SPACING(2),
  },
  header: {
    gap: SPACING(2),
    marginBottom: SPACING(2),
  },
});
