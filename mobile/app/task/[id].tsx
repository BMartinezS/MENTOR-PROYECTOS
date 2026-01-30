import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, HelperText, Text, TextInput, Checkbox } from 'react-native-paper';

import { useLocalSearchParams } from 'expo-router';

import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import Screen from '../components/Screen';
import SectionHeading from '../components/SectionHeading';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';
import { Phase, Task } from '../../src/types/models';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const isPro = user?.tier === 'pro';

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [projectPhases, setProjectPhases] = useState<Phase[]>([]);
  const [phaseLoading, setPhaseLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<Task['priority']>('medium');
  const [selectedDueDate, setSelectedDueDate] = useState('');

  const loadPhases = async (projectId: string) => {
    if (!isPro) return;
    try {
      setPhaseLoading(true);
      const detail = await api.projects.getById(projectId);
      setProjectPhases(detail.phases ?? []);
    } catch (err) {
      console.warn('No se pudieron cargar las fases', err);
    } finally {
      setPhaseLoading(false);
    }
  };

  const load = async () => {
    try {
      setError(null);
      setSuccess(null);
      const data = await api.tasks.getById(String(id));
      setTask(data);
      setSelectedPriority(data.priority ?? 'medium');
      setSelectedDueDate(data.dueDate ?? '');
      setSelectedPhaseId(data.phaseId ?? null);
      void loadPhases(data.projectId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la tarea');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    void load();
  }, [id]);

  const complete = async () => {
    try {
      if (!task) return;
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      await api.tasks.complete(task.id, {
        notes: notes.trim() ? notes.trim() : undefined,
        evidenceUrl: evidenceUrl.trim() ? evidenceUrl.trim() : undefined,
      });

      setSuccess('Tarea marcada como completada');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo completar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChecklistToggle = async (itemId: string, completed: boolean) => {
    if (!task || !isPro) return;
    try {
      setUpdateError(null);
      await api.tasks.update(task.id, {
        checklistUpdates: [{ id: itemId, completed }],
      });
      await load();
    } catch (e) {
      setUpdateError(e instanceof Error ? e.message : 'No se pudo actualizar el checklist');
    }
  };

  const handleTaskUpdate = async () => {
    if (!task || !isPro) return;
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      await api.tasks.update(task.id, {
        priority: selectedPriority,
        dueDate: selectedDueDate.trim() ? selectedDueDate.trim() : null,
        phaseId: selectedPhaseId,
      });
      await load();
    } catch (e) {
      setUpdateError(e instanceof Error ? e.message : 'No se pudo actualizar la tarea');
    } finally {
      setUpdateLoading(false);
    }
  };

  const moveTask = async (direction: 'up' | 'down') => {
    if (!task || !isPro) return;
    try {
      setReorderLoading(true);
      setUpdateError(null);
      await api.tasks.update(task.id, { reorderDirection: direction });
      await load();
    } catch (e) {
      setUpdateError(e instanceof Error ? e.message : 'No se pudo reordenar la tarea');
    } finally {
      setReorderLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        {loading ? <Text>Cargando...</Text> : null}
        {error ? <HelperText type="error">{error}</HelperText> : null}
        {success ? <HelperText type="info">{success}</HelperText> : null}

        {task ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="headlineSmall">{task.title}</Text>
              <Chip style={styles.statusChip}>{task.status ?? 'pending'}</Chip>
              {task.description ? <Text style={styles.secondary}>{task.description}</Text> : null}

              <View style={styles.metaGrid}>
                {task.dueDate ? (
                  <View>
                    <Text style={styles.metaLabel}>Fecha límite</Text>
                    <Text>{task.dueDate}</Text>
                  </View>
                ) : null}
                {typeof task.estimatedHours === 'number' ? (
                  <View>
                    <Text style={styles.metaLabel}>Horas estimadas</Text>
                    <Text>{task.estimatedHours}</Text>
                  </View>
                ) : null}
                {task.priority ? (
                  <View>
                    <Text style={styles.metaLabel}>Prioridad</Text>
                    <Text>{task.priority}</Text>
                  </View>
                ) : null}
              </View>

              {task.metrics ? (
                <View style={styles.metrics}>
                  <SectionHeading title="Métricas" subtitle="Impacto estimado" />
                  <View style={styles.metricsRow}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Impacto</Text>
                      <Text style={styles.metricValue}>{task.metrics.impact ?? 'N/A'}</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Esfuerzo</Text>
                      <Text style={styles.metricValue}>{task.metrics.effort ?? '--'} pts</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Bloques foco</Text>
                      <Text style={styles.metricValue}>{task.metrics.focusBlocks ?? '--'}</Text>
                    </View>
                  </View>
                </View>
              ) : null}

              {task.checklist?.length ? (
                <View style={styles.checklist}>
                  <SectionHeading
                    title="Checklist"
                    subtitle={isPro ? 'Marca avances y comentarios' : 'Vista de solo lectura en plan Free'}
                  />
                  {task.checklist.map((item) => (
                    <View key={item.id} style={styles.checklistItem}>
                      <Checkbox
                        status={item.completed ? 'checked' : 'unchecked'}
                        onPress={() => handleChecklistToggle(item.id, !item.completed)}
                        disabled={!isPro}
                      />
                      <Text style={[styles.checklistLabel, item.completed && styles.completedText]}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {task.blockedReason ? (
                <Text style={styles.blocked}>Bloqueo actual: {task.blockedReason}</Text>
              ) : null}

              <View style={styles.form}>
                <TextInput
                  label="Notas (opcional)"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Evidencia (link opcional)"
                  value={evidenceUrl}
                  onChangeText={setEvidenceUrl}
                  autoCapitalize="none"
                  mode="outlined"
                  style={styles.input}
                />
              </View>

              {isPro ? (
                <View style={styles.proControls}>
                  <SectionHeading title="Controles Pro" subtitle="Edita la tarea y muévela entre fases" />
                  <View style={styles.phaseSelector}>
                    {phaseLoading ? (
                      <Text style={styles.secondary}>Cargando fases…</Text>
                    ) : projectPhases.length ? (
                      projectPhases.map((phase) => (
                        <Chip
                          key={phase.id}
                          mode={selectedPhaseId === phase.id ? 'contained' : 'outlined'}
                          onPress={() => setSelectedPhaseId(phase.id)}
                        >
                          {phase.name}
                        </Chip>
                      ))
                    ) : (
                      <Text style={styles.secondary}>Aún no hay fases configuradas.</Text>
                    )}
                  </View>
                  <TextInput
                    label="Nueva fecha límite"
                    value={selectedDueDate}
                    onChangeText={setSelectedDueDate}
                    placeholder="YYYY-MM-DD"
                    mode="outlined"
                    style={styles.input}
                  />
                  <View style={styles.priorityRow}>
                    {(['low', 'medium', 'high'] as Task['priority'][]).map((priority) => (
                      <Chip
                        key={priority}
                        mode={selectedPriority === priority ? 'contained' : 'outlined'}
                        onPress={() => setSelectedPriority(priority)}
                      >
                        {priority}
                      </Chip>
                    ))}
                  </View>
                  <View style={styles.proActionsRow}>
                    <Button
                      mode="contained"
                      onPress={handleTaskUpdate}
                      loading={updateLoading}
                      disabled={updateLoading}
                    >
                      Guardar cambios
                    </Button>
                    <Button mode="outlined" onPress={() => moveTask('up')} disabled={reorderLoading}>
                      Subir
                    </Button>
                    <Button mode="outlined" onPress={() => moveTask('down')} disabled={reorderLoading}>
                      Bajar
                    </Button>
                  </View>
                  {updateError ? <HelperText type="error">{updateError}</HelperText> : null}
                </View>
              ) : (
                <HelperText type="info">Actualiza a Pro para editar y reorganizar las tareas del plan.</HelperText>
              )}
            </Card.Content>
            <Card.Actions>
              <Button mode="outlined" onPress={load}>
                Refrescar
              </Button>
              <Button mode="contained" onPress={complete} loading={submitting} disabled={submitting}>
                Completar
              </Button>
            </Card.Actions>
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING(3),
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginVertical: SPACING(1),
  },
  secondary: {
    color: COLORS.textMuted,
    marginBottom: SPACING(1),
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING(2),
    marginBottom: SPACING(1),
  },
  metaLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  blocked: {
    color: COLORS.danger,
    marginBottom: SPACING(1),
  },
  form: {
    marginTop: SPACING(2),
    gap: SPACING(1),
  },
  input: {
    backgroundColor: COLORS.surface,
  },
  metrics: {
    marginTop: SPACING(2),
    gap: SPACING(1),
  },
  metricsRow: {
    flexDirection: 'row',
    gap: SPACING(1.5),
  },
  metricItem: {
    flex: 1,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.md,
    padding: SPACING(1),
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  metricValue: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 16,
  },
  checklist: {
    marginTop: SPACING(2),
    gap: SPACING(0.5),
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklistLabel: {
    color: COLORS.text,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  proControls: {
    marginTop: SPACING(3),
    gap: SPACING(1),
  },
  phaseSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING(1),
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING(1),
  },
  proActionsRow: {
    flexDirection: 'row',
    gap: SPACING(1),
    flexWrap: 'wrap',
    alignItems: 'center',
  },
});
