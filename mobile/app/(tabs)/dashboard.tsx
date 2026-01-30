import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Zap, PenTool, Briefcase, CheckSquare, ChevronRight } from 'lucide-react-native';

import { useRouter } from 'expo-router';

import { COLORS, RADIUS, SPACING, SHADOWS, MINIMAL_CARD } from '../../constants/theme';
import AppHeader from '../components/AppHeader';
import CheckinCard from '../components/CheckinCard';
import EmptyState from '../components/EmptyState';
import HighlightCard from '../components/HighlightCard';
import LevelBadge from '../components/LevelBadge';
import ProjectCard from '../components/ProjectCard';
import Screen from '../components/Screen';
import SectionHeading from '../components/SectionHeading';
import { ProjectCardSkeleton, CheckinCardSkeleton } from '../components/SkeletonLoaderSimple';
import StreakBadge from '../components/StreakBadge';
import XPBadge from '../components/XPBadge';
import { api, isMockApi } from '../../src/services/api';
import { getMyStats, UserStats } from '../../src/services/statsService';
import { Checkin, Project } from '../../src/types/models';

/**
 * Minimalist Dashboard
 * - Clean, airy layout
 * - Subtle shadows
 * - Generous whitespace
 */
export default function DashboardScreen() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [pendingCheckins, setPendingCheckins] = useState<Checkin[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      const [projectsResponse, checkinsResponse, statsResponse] = await Promise.all([
        api.projects.list(),
        api.checkins.pending().catch(() => []),
        getMyStats().catch(() => null),
      ]);
      setProjects(projectsResponse);
      setPendingCheckins(checkinsResponse);
      setUserStats(statsResponse);
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
      description: 'Describe tu idea y recibe un plan estructurado',
      onPress: () => router.push('/project/ai'),
      icon: Zap,
      iconBg: `${COLORS.primary}15`,
      iconColor: COLORS.primary,
    },
    {
      title: 'Crear manual',
      description: 'Define tu proyecto paso a paso',
      onPress: () => router.push('/project/manual'),
      icon: PenTool,
      iconBg: `${COLORS.secondary}20`,
      iconColor: COLORS.secondary,
    },
  ];

  const renderQuickAction = (action: typeof quickActions[0]) => {
    const Icon = action.icon;
    return (
      <Pressable
        key={action.title}
        onPress={action.onPress}
        style={({ pressed }) => [
          styles.quickCard,
          pressed && styles.quickCardPressed,
        ]}
      >
        <View style={[styles.quickIconWrapper, { backgroundColor: action.iconBg }]}>
          <Icon size={20} color={action.iconColor} />
        </View>
        <View style={styles.quickContent}>
          <Text style={styles.quickTitle}>{action.title}</Text>
          <Text style={styles.quickDescription}>{action.description}</Text>
        </View>
        <ChevronRight size={20} color={COLORS.textLight} />
      </Pressable>
    );
  };

  const renderProject = ({ item }: { item: Project }) => (
    <ProjectCard
      project={item}
      onPress={() => router.push(`/project/${item.id}`)}
    />
  );

  return (
    <Screen padded={false}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader onPrimaryAction={() => router.push('/project/new')} />

        {/* User Stats Row - Level, Streak and XP */}
        <View style={styles.userStatsRow}>
          <LevelBadge totalXP={userStats?.totalXP ?? 0} />
          <StreakBadge
            currentStreak={userStats?.currentStreak ?? 0}
            longestStreak={userStats?.longestStreak ?? 0}
          />
          <XPBadge totalXP={userStats?.totalXP ?? 0} />
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <HighlightCard
            label="Activos"
            value={`${stats.active}`}
            icon={<Briefcase size={18} color={COLORS.primary} />}
            accent={COLORS.primary}
          />
          <HighlightCard
            label="Completados"
            value={`${stats.completed}`}
            icon={<CheckSquare size={18} color={COLORS.secondary} />}
            accent={COLORS.secondary}
          />
        </View>

        {/* Quick actions */}
        <SectionHeading title="Crear proyecto" />
        <View style={styles.quickActionsColumn}>
          {quickActions.map(renderQuickAction)}
        </View>

        {/* Pending checkins */}
        {loading && !pendingCheckins.length ? (
          <>
            <SectionHeading title="Check-ins pendientes" />
            <CheckinCardSkeleton />
          </>
        ) : pendingCheckins.length > 0 && (
          <>
            <SectionHeading
              title="Check-ins pendientes"
              actionLabel="Ver todos"
              onActionPress={() => router.push('/(tabs)/checkins')}
            />
            <CheckinCard
              checkin={pendingCheckins[0]}
              onRespond={() => router.push('/(tabs)/checkins')}
            />
          </>
        )}

        {/* Projects */}
        <SectionHeading
          title="Tus proyectos"
          subtitle={isMockApi ? 'Modo demo' : undefined}
          actionLabel="Ver todos"
          onActionPress={() => router.push('/project/new')}
        />
        {loading ? (
          <View>
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </View>
        ) : projects.length > 0 ? (
          <FlatList
            data={projects}
            renderItem={renderProject}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <EmptyState
            title="Aún no tienes proyectos"
            description="Crea tu primer proyecto con ayuda de IA o de forma manual"
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
    paddingHorizontal: SPACING(2.5),
    paddingBottom: SPACING(4),
  },
  userStatsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: SPACING(1.5),
    marginBottom: SPACING(2),
  },
  errorBanner: {
    backgroundColor: `${COLORS.danger}15`,
    padding: SPACING(2),
    borderRadius: RADIUS.md,
    marginBottom: SPACING(2),
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING(2),
    marginBottom: SPACING(3),
  },
  quickActionsColumn: {
    gap: SPACING(1.5),
    marginBottom: SPACING(3),
  },
  quickCard: {
    ...MINIMAL_CARD,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING(2),
    gap: SPACING(1.5),
  },
  quickCardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
  quickIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickContent: {
    flex: 1,
  },
  quickTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  quickDescription: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
});
