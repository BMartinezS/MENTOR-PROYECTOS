import { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useRouter } from 'expo-router';

import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import AppHeader from '../components/AppHeader';
import CheckinCard from '../components/CheckinCard';
import EmptyState from '../components/EmptyState';
import HighlightCard from '../components/HighlightCard';
import ProjectCard from '../components/ProjectCard';
import Screen from '../components/Screen';
import SectionHeading from '../components/SectionHeading';
import { ProjectCardSkeleton, CheckinCardSkeleton } from '../components/SkeletonLoaderSimple';
import { api, isMockApi } from '../services/api';
import { Checkin, Project } from '../types/models';

export default function DashboardScreen() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [pendingCheckins, setPendingCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      const [projectsResponse, checkinsResponse] = await Promise.all([
        api.projects.list(),
        api.checkins.pending().catch(() => []),
      ]);
      setProjects(projectsResponse);
      setPendingCheckins(checkinsResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status !== 'completed').length;
    const completed = projects.filter((p) => p.status === 'completed').length;
    return { active, completed };
  }, [projects]);

  const quickActions = [
    {
      title: 'Plan con IA',
      description: 'Describe tu idea y recibe fases + tareas.',
      onPress: () => router.push('/project/ai'),
      accent: 'rgba(155,109,255,0.25)',
    },
    {
      title: 'Crear manual',
      description: 'Define título, fecha y comienza con foco.',
      onPress: () => router.push('/project/manual'),
      accent: 'rgba(255,157,77,0.18)',
    },
  ];

  const renderQuickAction = (action: typeof quickActions[0]) => (
    <View key={action.title} style={[styles.quickCard, { backgroundColor: action.accent }]}>
      <Text variant="titleMedium">{action.title}</Text>
      <Text style={styles.quickDescription}>{action.description}</Text>
      <Text style={styles.quickLink} onPress={action.onPress}>
        Comenzar →
      </Text>
    </View>
  );

  const renderProject = ({ item }: { item: Project }) => (
    <ProjectCard
      key={item.id}
      project={item}
      onPress={() => router.push(`/project/${item.id}`)}
    />
  );

  return (
    <Screen padded={false}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        <AppHeader onPrimaryAction={() => router.push('/project/new')} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.statsRow}>
          <HighlightCard label="Activos" value={`${stats.active}`} />
          <HighlightCard label="Completados" value={`${stats.completed}`} accent="rgba(255,157,77,0.25)" />
        </View>

        <SectionHeading title="Acciones rápidas" subtitle="Lo que necesitas a un toque" />
        <View style={styles.quickActionsColumn}>{quickActions.map(renderQuickAction)}</View>

        {loading && !pendingCheckins.length ? (
          <>
            <SectionHeading title="Check-ins pendientes" subtitle="Responde para mantener tu ritmo" />
            <CheckinCardSkeleton />
          </>
        ) : pendingCheckins.length ? (
          <>
            <SectionHeading title="Check-ins pendientes" subtitle="Responde para mantener tu ritmo" />
            <CheckinCard
              checkin={pendingCheckins[0]}
              onRespond={() => router.push('/(tabs)/checkins')}
            />
          </>
        ) : null}

        <SectionHeading
          title="Proyectos activos"
          subtitle={`${projects.length} en marcha${isMockApi ? ' · Modo demo' : ''}`}
          actionLabel="Ver todos"
          onActionPress={() => router.push('/project/new')}
        />
        {loading ? (
          <View style={styles.projectsList}>
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </View>
        ) : projects.length ? (
          <FlatList
            data={projects}
            renderItem={renderProject}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.projectsList}
          />
        ) : (
          <EmptyState
            title="Aún no tienes proyectos"
            description="Crea uno manual o deja que la IA diseñe el plan por ti."
            ctaLabel="Crear proyecto"
            onCtaPress={() => router.push('/project/new')}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING(2),
    gap: SPACING(2),
  },
  error: {
    color: COLORS.danger,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING(2),
  },
  quickActionsColumn: {
    marginBottom: SPACING(2),
    gap: SPACING(1.5),
  },
  quickCard: {
    width: '100%',
    borderRadius: RADIUS.lg,
    padding: SPACING(2),
    gap: SPACING(1),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickDescription: {
    color: COLORS.text,
  },
  quickLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  projectsList: {
    gap: SPACING(2),
  },
});
