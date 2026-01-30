import { useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Chip,
  Dialog,
  Divider,
  HelperText,
  IconButton,
  Portal,
  ProgressBar,
  Text,
  TextInput,
} from 'react-native-paper';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { getProjectAreaConfig, ProjectDetailSection } from '../../src/config/projectAreas';
import Screen from '../components/Screen';
import SectionHeading from '../components/SectionHeading';
import TaskListItem from '../components/TaskListItem';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';
import { PlanIteration, ProjectDetail, Task } from '../../src/types/models';

function formatDate(value?: string | null) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isPro = user?.tier === 'pro';
  const { id } = useLocalSearchParams<{ id: string }>();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iterations, setIterations] = useState<PlanIteration[]>([]);
  const [iterationsLoading, setIterationsLoading] = useState(false);
  const [iterationModalVisible, setIterationModalVisible] = useState(false);
  const [iterationFeedback, setIterationFeedback] = useState('');
  const [iterationSubmitting, setIterationSubmitting] = useState(false);
  const [iterationError, setIterationError] = useState<string | null>(null);
  const [phaseModalVisible, setPhaseModalVisible] = useState(false);
  const [phaseDrafts, setPhaseDrafts] = useState<{ id: string; name: string; description?: string | null }[]>([]);
  const [phaseSubmitting, setPhaseSubmitting] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newPhaseDescription, setNewPhaseDescription] = useState('');
  const [phaseError, setPhaseError] = useState<string | null>(null);

  const loadProject = async () => {
    if (!id) return;
    try {
      setError(null);
      setLoading(true);
      const data = await api.projects.getById(String(id));
      setProject(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const loadIterations = async () => {
    if (!id) return;
    try {
      setIterationsLoading(true);
      const response = await api.projects.iterations(String(id));
      setIterations(response.iterations);
    } catch (e) {
      // omit errores para no bloquear la pantalla principal
    } finally {
      setIterationsLoading(false);
    }
  };

  const loadAll = async () => {
    await Promise.all([loadProject(), loadIterations()]);
  };

  useEffect(() => {
    if (!id) return;
    void loadAll();
  }, [id]);

  useEffect(() => {
    if (!project?.phases) {
      setPhaseDrafts([]);
      return;
    }
    setPhaseDrafts(project.phases.map((phase) => ({
      id: phase.id,
      name: phase.name,
      description: phase.description ?? '',
    })));
  }, [project?.phases]);

  const tasks = useMemo<Task[]>(() => {
    if (!project) return [];
    if (project.tasks?.length) return project.tasks;

    const fromPhases = project.phases?.flatMap((phase) => phase.tasks ?? []) ?? [];
    return fromPhases;
  }, [project]);

  const areaConfig = useMemo(() => getProjectAreaConfig(project?.area ?? null), [project?.area]);
  const AreaIcon = areaConfig.icon;
  const iterationLimit = isPro ? Infinity : 1;
  const iterationsRemaining = iterationLimit === Infinity ? Infinity : Math.max(0, iterationLimit - iterations.length);

  const renderObjective = ({ item }: { item: string }) => (
    <Text style={styles.listItem}>• {item}</Text>
  );

  const renderTask = ({ item }: { item: Task }) => (
    <TaskListItem
      task={item}
      onPress={() => router.push(`/task/${item.id}`)}
    />
  );

  const renderPhase = ({ item }: { item: any }) => (
    <View style={styles.phase}>
      <Text variant="titleMedium">{item.name}</Text>
      {item.description ? (
        <Text style={styles.secondary}>{item.description}</Text>
      ) : null}
      {item.milestones?.length ? (
        <FlatList
          data={item.milestones}
          renderItem={({ item: milestone }) => (
            <Text style={styles.milestone}>
              • {milestone.title}
              {milestone.dueDate ? ` · ${milestone.dueDate}` : ''}
            </Text>
          )}
          keyExtractor={(milestone) => milestone.id}
          scrollEnabled={false}
        />
      ) : null}
    </View>
  );

  const handleIteratePlan = async () => {
    if (!project) return;
    try {
      setIterationSubmitting(true);
      setIterationError(null);
      const response = await api.projects.iterate(project.id, {
        feedback: iterationFeedback.trim(),
      });
      setProject(response.project);
      setIterations(response.iterations);
      setIterationFeedback('');
      setIterationModalVisible(false);
    } catch (e) {
      setIterationError(e instanceof Error ? e.message : 'No se pudo iterar el plan');
    } finally {
      setIterationSubmitting(false);
    }
  };

  const handlePhaseDraftChange = (phaseId: string, field: 'name' | 'description', value: string) => {
    setPhaseDrafts((prev) => prev.map((phase) => (phase.id === phaseId ? { ...phase, [field]: value } : phase)));
  };

  const handlePhaseUpdate = async (phaseId: string) => {
    if (!project) return;
    const draft = phaseDrafts.find((phase) => phase.id === phaseId);
    if (!draft) return;
    try {
      setPhaseSubmitting(true);
      setPhaseError(null);
      const updated = await api.projects.updatePhase(project.id, phaseId, {
        name: draft.name,
        description: draft.description,
      });
      setProject(updated);
    } catch (e) {
      setPhaseError(e instanceof Error ? e.message : 'No se pudo actualizar la fase');
    } finally {
      setPhaseSubmitting(false);
    }
  };

  const handlePhaseReorder = async (fromIndex: number, toIndex: number) => {
    if (!project) return;
    if (toIndex < 0 || toIndex >= phaseDrafts.length) return;
    const previousDrafts = [...phaseDrafts];
    const draftCopy = [...previousDrafts];
    const [moved] = draftCopy.splice(fromIndex, 1);
    draftCopy.splice(toIndex, 0, moved);
    setPhaseDrafts(draftCopy);
    try {
      setPhaseSubmitting(true);
      setPhaseError(null);
      const updated = await api.projects.reorderPhases(project.id, {
        orderedPhaseIds: draftCopy.map((phase) => phase.id),
      });
      setProject(updated);
    } catch (e) {
      setPhaseError(e instanceof Error ? e.message : 'No se pudo reordenar');
      setPhaseDrafts(previousDrafts);
    } finally {
      setPhaseSubmitting(false);
    }
  };

  const handleCreatePhase = async () => {
    if (!project) return;
    if (!newPhaseName.trim()) {
      setPhaseError('Define un nombre para la nueva fase');
      return;
    }
    try {
      setPhaseSubmitting(true);
      setPhaseError(null);
      const updated = await api.projects.createPhase(project.id, {
        name: newPhaseName.trim(),
        description: newPhaseDescription.trim() ? newPhaseDescription.trim() : undefined,
        position: phaseDrafts.length,
      });
      setProject(updated);
      setNewPhaseName('');
      setNewPhaseDescription('');
    } catch (e) {
      setPhaseError(e instanceof Error ? e.message : 'No se pudo crear la fase');
    } finally {
      setPhaseSubmitting(false);
    }
  };

  const renderIterationCard = (iteration: PlanIteration) => (
    <View key={iteration.id} style={styles.iterationCard}>
      <View style={styles.iterationHeader}>
        <Text variant="titleMedium">{iteration.summary}</Text>
        <Text style={styles.secondary}>{formatDate(iteration.createdAt)}</Text>
      </View>
      {iteration.highlights?.length ? (
        <View style={styles.iterationHighlights}>
          {iteration.highlights.map((highlight) => (
            <Text key={highlight} style={styles.milestone}>
              • {highlight}
            </Text>
          ))}
        </View>
      ) : null}
      {iteration.planSnapshot?.objectives?.length ? (
        <View style={styles.iterationSnapshot}>
          <Text style={styles.snapshotTitle}>Objetivos sugeridos</Text>
          {iteration.planSnapshot.objectives.map((objective) => (
            <Text key={objective} style={styles.secondary}>
              · {objective}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );

  const detailSections = (project ? areaConfig.detailSectionOrder : [])
    .map((section: ProjectDetailSection) => {
      if (!project) return null;
      if (section === 'objectives' && project.objectives?.length) {
        return (
          <Card key="objectives" style={[styles.card, { borderColor: areaConfig.accent }]}>
            <Card.Content>
              <SectionHeading title="Objetivos" />
              <FlatList
                data={project.objectives}
                renderItem={renderObjective}
                keyExtractor={(item, index) => `${item}-${index}`}
                scrollEnabled={false}
              />
            </Card.Content>
          </Card>
        );
      }

      if (section === 'tasks' && tasks.length) {
        return (
          <Card key="tasks" style={[styles.card, { borderColor: areaConfig.accent }]}>
            <Card.Content>
              <SectionHeading title="Tareas" subtitle="Toca una tarea para profundizar" />
              <FlatList
                data={tasks}
                renderItem={renderTask}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.tasksList}
              />
            </Card.Content>
          </Card>
        );
      }

      if (section === 'phases' && project.phases?.length) {
        return (
          <Card key="phases" style={[styles.card, { borderColor: areaConfig.accent }]}>
            <Card.Content>
              <SectionHeading title="Fases" />
              <FlatList
                data={project.phases}
                renderItem={renderPhase}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.phasesList}
              />
            </Card.Content>
          </Card>
        );
      }

      return null;
    })
    .filter(Boolean);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        {loading ? <Text>Cargando...</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {project ? (
          <>
            <Card style={[styles.heroCard, { backgroundColor: areaConfig.surface, borderColor: areaConfig.accent }]}>
              <Card.Content>
                <View style={styles.areaHeader}>
                  <AreaIcon color={areaConfig.accent} size={32} />
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium">{areaConfig.label}</Text>
                    <Text style={styles.secondary}>{areaConfig.description}</Text>
                  </View>
                  <Chip style={[styles.areaChip, { backgroundColor: areaConfig.accent }]} textStyle={{ color: '#04030f' }}>
                    {project.area ?? 'general'}
                  </Chip>
                </View>

                <Text variant="headlineSmall" style={styles.projectTitle}>
                  {project.title}
                </Text>
                {project.description ? <Text style={styles.secondary}>{project.description}</Text> : null}
                <View style={styles.metaRow}>
                  <Chip compact>{project.status ?? 'active'}</Chip>
                  {project.targetDate ? <Text style={styles.secondary}>Meta: {project.targetDate}</Text> : null}
                </View>

                <View style={styles.progressRow}>
                  <Text style={styles.secondary}>Progreso</Text>
                  <Text>{project.progress ?? 0}%</Text>
                </View>
                <ProgressBar
                  progress={Math.max(0, Math.min(1, (project.progress ?? 0) / 100))}
                  style={styles.progressBar}
                  color={areaConfig.accent}
                />

                <View style={styles.actions}>
                  <Button mode="outlined" onPress={loadAll}>
                    Refrescar
                  </Button>
                  <Button mode="contained" onPress={() => router.push(`/weekly-review/${project.id}`)}>
                    Revisión semanal
                  </Button>
                </View>

                <View style={styles.actions}>
                  <Button
                    mode="contained"
                    onPress={() => setIterationModalVisible(true)}
                    disabled={!isPro && iterationsRemaining <= 0}
                  >
                    Iterar plan
                  </Button>
                  {isPro ? (
                    <Button mode="outlined" onPress={() => setPhaseModalVisible(true)}>
                      Gestionar fases
                    </Button>
                  ) : null}
                </View>
                {!isPro ? (
                  <HelperText type={iterationsRemaining <= 0 ? 'error' : 'info'}>
                    {iterationsRemaining <= 0
                      ? 'Ya usaste tu único reintento en plan Free.'
                      : 'Plan Free: 1 iteración disponible. Actualiza a Pro para iterar ilimitado.'}
                  </HelperText>
                ) : (
                  <HelperText type="info">Los clientes Pro pueden iterar y ajustar fases sin límites.</HelperText>
                )}
              </Card.Content>
            </Card>

            <Card style={[styles.card, { borderColor: areaConfig.accent }]}>
              <Card.Content>
                <SectionHeading title="Iteraciones del plan" subtitle="Compara ajustes realizados" />
                {iterationsLoading ? (
                  <Text style={styles.secondary}>Cargando iteraciones…</Text>
                ) : iterations.length ? (
                  <View style={styles.iterationsList}>{iterations.map(renderIterationCard)}</View>
                ) : (
                  <Text style={styles.secondary}>Aún no hay iteraciones registradas.</Text>
                )}
              </Card.Content>
            </Card>

            {detailSections}
          </>
        ) : null}
      </ScrollView>

      <Portal>
        <Dialog
          visible={iterationModalVisible}
          onDismiss={() => setIterationModalVisible(false)}
          style={styles.iterationDialog}
        >
          <Dialog.Title>Iterar plan</Dialog.Title>
          <Dialog.Content style={styles.iterationDialogContent}>
            <TextInput
              label="¿Qué quieres ajustar?"
              value={iterationFeedback}
              onChangeText={setIterationFeedback}
              multiline
              mode="outlined"
              numberOfLines={4}
              style={[styles.input, styles.iterationInput]}
            />
            <HelperText type="info">
              {isPro
                ? 'Puedes solicitar iteraciones ilimitadas y comparar resultados.'
                : 'Solo tienes 1 iteración en tu plan Free.'}
            </HelperText>
            {iterationError ? <HelperText type="error">{iterationError}</HelperText> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIterationModalVisible(false)}>Cancelar</Button>
            <Button
              mode="contained"
              onPress={handleIteratePlan}
              loading={iterationSubmitting}
              disabled={iterationSubmitting || !iterationFeedback.trim()}
            >
              Enviar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={phaseModalVisible} onDismiss={() => setPhaseModalVisible(false)}>
          <Dialog.Title>Gestión de fases</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 420 }}>
            <ScrollView contentContainerStyle={styles.phaseManagerList}>
              {phaseDrafts.map((phase, index) => (
                <Card key={phase.id} style={styles.phaseManagerCard}>
                  <Card.Content>
                    <TextInput
                      label="Nombre"
                      value={phase.name}
                      onChangeText={(text) => handlePhaseDraftChange(phase.id, 'name', text)}
                      mode="outlined"
                      style={styles.input}
                      disabled={phaseSubmitting}
                    />
                    <TextInput
                      label="Descripción"
                      value={phase.description ?? ''}
                      onChangeText={(text) => handlePhaseDraftChange(phase.id, 'description', text)}
                      mode="outlined"
                      style={styles.input}
                      disabled={phaseSubmitting}
                    />
                    <View style={styles.phaseManagerActions}>
                      <IconButton
                        icon="chevron-up"
                        onPress={() => handlePhaseReorder(index, index - 1)}
                        disabled={index === 0 || phaseSubmitting}
                      />
                      <IconButton
                        icon="chevron-down"
                        onPress={() => handlePhaseReorder(index, index + 1)}
                        disabled={index === phaseDrafts.length - 1 || phaseSubmitting}
                      />
                      <Button onPress={() => handlePhaseUpdate(phase.id)} loading={phaseSubmitting}>
                        Guardar
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              ))}
              <Divider />
              <Text variant="titleSmall">Nueva fase</Text>
              <TextInput
                label="Nombre"
                value={newPhaseName}
                onChangeText={setNewPhaseName}
                mode="outlined"
                style={styles.input}
                disabled={phaseSubmitting}
              />
              <TextInput
                label="Descripción"
                value={newPhaseDescription}
                onChangeText={setNewPhaseDescription}
                mode="outlined"
                style={styles.input}
                disabled={phaseSubmitting}
              />
              <Button mode="contained" onPress={handleCreatePhase} loading={phaseSubmitting}>
                Agregar fase
              </Button>
              {phaseError ? <HelperText type="error">{phaseError}</HelperText> : null}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setPhaseModalVisible(false)}>Cerrar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING(2),
    paddingBottom: SPACING(4),
    paddingHorizontal: SPACING(2),
  },
  secondary: {
    color: COLORS.textMuted,
  },
  error: {
    color: COLORS.danger,
  },
  actions: {
    marginTop: SPACING(1),
    flexDirection: 'row',
    gap: SPACING(1),
    flexWrap: 'wrap',
  },
  heroCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING(1),
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING(2),
    marginBottom: SPACING(0.5),
  },
  progressBar: {
    height: 10,
    borderRadius: RADIUS.sm,
  },
  listItem: {
    marginBottom: SPACING(0.5),
  },
  tasksList: {
    gap: SPACING(1),
  },
  phasesList: {
    gap: SPACING(2),
  },
  phase: {
    marginBottom: SPACING(2),
  },
  milestone: {
    color: COLORS.textMuted,
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1),
    marginBottom: SPACING(1),
  },
  areaChip: {
    alignSelf: 'flex-start',
  },
  projectTitle: {
    marginBottom: SPACING(0.5),
  },
  iterationsList: {
    gap: SPACING(1.5),
  },
  iterationCard: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING(1.5),
    gap: SPACING(1),
  },
  iterationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iterationHighlights: {
    gap: SPACING(0.5),
  },
  iterationSnapshot: {
    gap: SPACING(0.5),
  },
  snapshotTitle: {
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.surface,
    marginTop: SPACING(1),
  },
  iterationDialog: {
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  iterationDialogContent: {
    backgroundColor: COLORS.surface,
  },
  iterationInput: {
    minHeight: SPACING(9),
    textAlignVertical: 'top' as const,
  },
  phaseManagerList: {
    gap: SPACING(1.5),
    paddingBottom: SPACING(2),
  },
  phaseManagerCard: {
    backgroundColor: COLORS.surface,
  },
  phaseManagerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
