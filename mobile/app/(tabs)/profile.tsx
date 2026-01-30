import { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Linking, Modal, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import {
  User,
  Mail,
  Globe,
  Crown,
  Zap,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Star,
  Infinity,
  BarChart3,
  RefreshCw,
  FileText,
  Lock,
  Trash2,
  Award,
  X,
  Trophy,
  Flame,
  CheckCircle,
  Target,
  Sparkles,
} from 'lucide-react-native';

import { useRouter } from 'expo-router';

import { COLORS, RADIUS, SPACING, BORDERS, SHADOWS, MINIMAL_CARD, BRUTAL_BUTTON_SECONDARY, BRUTAL_CARD } from '../../constants/theme';
import Screen from '../components/Screen';
import LevelBadge from '../components/LevelBadge';
import { useAuth } from '../../src/contexts/AuthContext';
import { isMockApi } from '../../src/services/api';
import { getMyStats, UserStats } from '../../src/services/statsService';
import {
  getMyAchievements,
  getAllAchievements,
  Achievement,
  UserAchievement,
} from '../../src/services/achievementsService';

/**
 * Minimalist Profile Screen
 * - Clean user card with avatar
 * - Neo-Brutalist Pro upgrade banner (for conversion)
 * - Soft shadows and rounded corners
 */
export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UserAchievement[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<{
    achievement: Achievement;
    unlocked: boolean;
    unlockedAt?: string;
  } | null>(null);

  const isPro = user?.tier === 'pro';

  const loadAchievements = useCallback(async () => {
    try {
      setAchievementsLoading(true);
      const [statsResponse, myAchievementsRes, allAchievementsRes] = await Promise.all([
        getMyStats().catch(() => null),
        getMyAchievements().catch(() => ({ achievements: [], totalXPFromAchievements: 0 })),
        getAllAchievements().catch(() => ({ achievements: [] })),
      ]);
      setUserStats(statsResponse);
      setUnlockedAchievements(myAchievementsRes.achievements);
      setAllAchievements(allAchievementsRes.achievements);
    } catch {
      // Silently handle errors - achievements are non-critical
    } finally {
      setAchievementsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAchievements();
  }, [loadAchievements]);

  const unlockedIds = new Set(unlockedAchievements.map((ua) => ua.achievementId));

  const getAchievementIcon = (category: Achievement['category'], size: number, color: string) => {
    switch (category) {
      case 'streak':
        return <Flame size={size} color={color} />;
      case 'tasks':
        return <CheckCircle size={size} color={color} />;
      case 'projects':
        return <Target size={size} color={color} />;
      case 'checkins':
        return <Trophy size={size} color={color} />;
      case 'special':
        return <Sparkles size={size} color={color} />;
      default:
        return <Award size={size} color={color} />;
    }
  };

  const handleAchievementPress = (achievement: Achievement) => {
    const userAchievement = unlockedAchievements.find(
      (ua) => ua.achievementId === achievement.id
    );
    setSelectedAchievement({
      achievement,
      unlocked: unlockedIds.has(achievement.id),
      unlockedAt: userAchievement?.unlockedAt,
    });
  };

  const handleUpgrade = () => {
    router.push('/paywall');
  };

  const handleResetDemo = async () => {
    if (!isMockApi) return;
    const module = await import('../../src/services/mockStore');
    module.resetMockStore();
    setResetMessage('Datos reiniciados');
    await logout();
    router.replace('/(auth)/login');
  };

  const handleOpenUrl = (url: string) => {
    Linking.openURL(url);
  };

  const initials = (user?.name || user?.email || 'U')
    .split(' ')
    .map((part) => part.trim()[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            {isPro && (
              <View style={styles.proBadgeSmall}>
                <Crown size={12} color="#FFFFFF" />
              </View>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={[styles.tierBadge, isPro && styles.tierBadgePro]}>
              <Text style={[styles.tierText, isPro && styles.tierTextPro]}>
                {isPro ? 'PRO' : 'Free'}
              </Text>
            </View>
          </View>
        </View>

        {/* Pro Upgrade Banner - Neo-Brutalist for conversion */}
        {!isPro && (
          <Pressable
            onPress={handleUpgrade}
            style={({ pressed }) => [
              styles.upgradeCard,
              pressed && styles.upgradeCardPressed,
            ]}
          >
            <View style={styles.upgradeHeader}>
              <View style={styles.upgradeIconWrapper}>
                <Zap size={26} color={COLORS.text} fill="#FFE66D" />
              </View>
              <View style={styles.upgradeHeaderText}>
                <Text style={styles.upgradeTitle}>DESBLOQUEA PRO</Text>
                <Text style={styles.upgradeSubtitle}>Lleva tus proyectos al siguiente nivel</Text>
              </View>
              <ChevronRight size={24} color={COLORS.text} />
            </View>

            <View style={styles.upgradeBenefits}>
              <View style={styles.benefitItem}>
                <Infinity size={14} color={COLORS.text} />
                <Text style={styles.benefitText}>Proyectos ilimitados</Text>
              </View>
              <View style={styles.benefitItem}>
                <Star size={14} color={COLORS.text} />
                <Text style={styles.benefitText}>Check-ins ilimitados</Text>
              </View>
              <View style={styles.benefitItem}>
                <BarChart3 size={14} color={COLORS.text} />
                <Text style={styles.benefitText}>Analytics de progreso</Text>
              </View>
            </View>

            <View style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>VER PLANES</Text>
            </View>
          </Pressable>
        )}

        {/* Pro Status Card (for pro users) */}
        {isPro && (
          <View style={styles.proStatusCard}>
            <View style={styles.proStatusHeader}>
              <Crown size={22} color={COLORS.secondary} />
              <Text style={styles.proStatusTitle}>Plan Pro activo</Text>
            </View>
            <Text style={styles.proStatusText}>
              Tienes acceso completo a todas las funciones premium.
            </Text>
          </View>
        )}

        {/* Level and Stats */}
        <View style={styles.levelSection}>
          <LevelBadge totalXP={userStats?.totalXP ?? 0} showProgress />
        </View>

        {/* Achievements Section */}
        <View style={styles.achievementsSection}>
          <View style={styles.achievementsSectionHeader}>
            <Award size={20} color={COLORS.primary} />
            <Text style={styles.achievementsSectionTitle}>Mis Logros</Text>
            <Text style={styles.achievementsCount}>
              {unlockedAchievements.length}/{allAchievements.length}
            </Text>
          </View>

          {achievementsLoading ? (
            <View style={styles.achievementsLoading}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.achievementsLoadingText}>Cargando logros...</Text>
            </View>
          ) : allAchievements.length === 0 ? (
            <View style={styles.achievementsEmpty}>
              <Award size={32} color={COLORS.textLight} />
              <Text style={styles.achievementsEmptyText}>
                Los logros estaran disponibles pronto
              </Text>
            </View>
          ) : (
            <View style={styles.achievementsGrid}>
              {allAchievements.map((achievement) => {
                const isUnlocked = unlockedIds.has(achievement.id);
                return (
                  <Pressable
                    key={achievement.id}
                    onPress={() => handleAchievementPress(achievement)}
                    style={({ pressed }) => [
                      styles.achievementBadge,
                      isUnlocked && styles.achievementBadgeUnlocked,
                      pressed && styles.achievementBadgePressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.achievementIconWrapper,
                        isUnlocked && styles.achievementIconWrapperUnlocked,
                      ]}
                    >
                      {getAchievementIcon(
                        achievement.category,
                        24,
                        isUnlocked ? COLORS.surface : COLORS.textLight
                      )}
                    </View>
                    <Text
                      style={[
                        styles.achievementName,
                        isUnlocked && styles.achievementNameUnlocked,
                      ]}
                      numberOfLines={2}
                    >
                      {achievement.name}
                    </Text>
                    {!isUnlocked && (
                      <View style={styles.lockedOverlay}>
                        <Lock size={14} color={COLORS.textLight} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Achievement Detail Modal */}
        <Modal
          visible={selectedAchievement !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedAchievement(null)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setSelectedAchievement(null)}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              {selectedAchievement && (
                <>
                  <Pressable
                    style={styles.modalClose}
                    onPress={() => setSelectedAchievement(null)}
                  >
                    <X size={20} color={COLORS.textMuted} />
                  </Pressable>

                  <View
                    style={[
                      styles.modalIconWrapper,
                      selectedAchievement.unlocked && styles.modalIconWrapperUnlocked,
                    ]}
                  >
                    {getAchievementIcon(
                      selectedAchievement.achievement.category,
                      40,
                      selectedAchievement.unlocked ? COLORS.surface : COLORS.textLight
                    )}
                  </View>

                  <Text style={styles.modalTitle}>
                    {selectedAchievement.achievement.name}
                  </Text>

                  <Text style={styles.modalDescription}>
                    {selectedAchievement.achievement.description}
                  </Text>

                  <View style={styles.modalXPBadge}>
                    <Star size={16} color={COLORS.secondary} fill={COLORS.secondary} />
                    <Text style={styles.modalXPText}>
                      +{selectedAchievement.achievement.xpReward} XP
                    </Text>
                  </View>

                  {selectedAchievement.unlocked ? (
                    <View style={styles.modalUnlockedBadge}>
                      <CheckCircle size={16} color={COLORS.secondary} />
                      <Text style={styles.modalUnlockedText}>
                        Desbloqueado{' '}
                        {selectedAchievement.unlockedAt
                          ? new Date(selectedAchievement.unlockedAt).toLocaleDateString('es-ES')
                          : ''}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.modalLockedBadge}>
                      <Lock size={16} color={COLORS.textMuted} />
                      <Text style={styles.modalLockedText}>Aun no desbloqueado</Text>
                    </View>
                  )}
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconWrapper}>
                <User size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.menuLabel}>Nombre</Text>
                <Text style={styles.menuValue}>{user?.name || 'No definido'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconWrapper}>
                <Mail size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.menuLabel}>Email</Text>
                <Text style={styles.menuValue}>{user?.email}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconWrapper}>
                <Globe size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.menuLabel}>Zona horaria</Text>
                <Text style={styles.menuValue}>{user?.timezone || 'America/Santiago'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>

          <Pressable
            style={({ pressed }) => [
              styles.menuItemPressable,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => router.push('/(tabs)/notifications')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconWrapper, { backgroundColor: `${COLORS.secondary}15` }]}>
                <Bell size={18} color={COLORS.secondary} />
              </View>
              <View>
                <Text style={styles.menuLabel}>Notificaciones</Text>
                <Text style={styles.menuValueMuted}>Configura recordatorios</Text>
              </View>
            </View>
            <ChevronRight size={20} color={COLORS.textLight} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuItemPressable,
              { borderBottomWidth: 0 },
              pressed && styles.menuItemPressed,
            ]}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconWrapper, { backgroundColor: `${COLORS.tertiary}15` }]}>
                <Shield size={18} color={COLORS.tertiary} />
              </View>
              <View>
                <Text style={styles.menuLabel}>Privacidad</Text>
                <Text style={styles.menuValueMuted}>Gestiona tus datos</Text>
              </View>
            </View>
            <ChevronRight size={20} color={COLORS.textLight} />
          </Pressable>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>

          <Pressable
            style={({ pressed }) => [
              styles.menuItemPressable,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => handleOpenUrl('https://warlocklabs.cl/terms')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconWrapper, { backgroundColor: `${COLORS.primary}12` }]}>
                <FileText size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.menuLabel}>Términos de Servicio</Text>
              </View>
            </View>
            <ChevronRight size={20} color={COLORS.textLight} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuItemPressable,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => handleOpenUrl('https://warlocklabs.cl/privacy')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconWrapper, { backgroundColor: `${COLORS.tertiary}15` }]}>
                <Lock size={18} color={COLORS.tertiary} />
              </View>
              <View>
                <Text style={styles.menuLabel}>Política de Privacidad</Text>
              </View>
            </View>
            <ChevronRight size={20} color={COLORS.textLight} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuItemPressable,
              { borderBottomWidth: 0 },
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => handleOpenUrl('https://warlocklabs.cl/delete-account')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconWrapper, { backgroundColor: `${COLORS.danger}12` }]}>
                <Trash2 size={18} color={COLORS.danger} />
              </View>
              <View>
                <Text style={styles.menuLabel}>Eliminar mi cuenta</Text>
              </View>
            </View>
            <ChevronRight size={20} color={COLORS.textLight} />
          </Pressable>
        </View>

        {/* Demo Mode Banner */}
        {isMockApi && (
          <View style={styles.demoCard}>
            <View style={styles.demoHeader}>
              <RefreshCw size={18} color={COLORS.textMuted} />
              <Text style={styles.demoTitle}>Modo demo</Text>
            </View>
            <Text style={styles.demoText}>
              Estás usando datos de prueba. Puedes reiniciarlos para volver al estado inicial.
            </Text>
            <Pressable
              onPress={handleResetDemo}
              style={({ pressed }) => [
                styles.demoButton,
                pressed && styles.demoButtonPressed,
              ]}
            >
              <Text style={styles.demoButtonText}>Reiniciar datos</Text>
            </Pressable>
            {resetMessage && (
              <Text style={styles.resetMessage}>{resetMessage}</Text>
            )}
          </View>
        )}

        {/* Logout Button */}
        <Pressable
          onPress={logout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
        >
          <LogOut size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>

        {/* App Version */}
        <Text style={styles.version}>Mentor Proyectos v1.0.0</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING(2.5),
    paddingVertical: SPACING(3),
    gap: SPACING(2.5),
    paddingBottom: SPACING(4),
  },
  header: {
    marginBottom: SPACING(0.5),
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },

  // User Card
  userCard: {
    ...MINIMAL_CARD,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING(2.5),
    gap: SPACING(2),
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  proBadgeSmall: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  userInfo: {
    flex: 1,
    gap: SPACING(0.5),
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  tierBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.backgroundAlt,
    paddingVertical: SPACING(0.5),
    paddingHorizontal: SPACING(1.5),
    borderRadius: RADIUS.full,
    marginTop: SPACING(0.5),
  },
  tierBadgePro: {
    backgroundColor: `${COLORS.secondary}20`,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tierTextPro: {
    color: COLORS.secondary,
    fontWeight: '700',
  },

  // Upgrade Card - Neo-Brutalist for conversion
  upgradeCard: {
    ...BRUTAL_BUTTON_SECONDARY,
    padding: SPACING(2.5),
    gap: SPACING(2),
  },
  upgradeCardPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: 0, height: 0 },
  },
  upgradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1.5),
  },
  upgradeIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeHeaderText: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  upgradeSubtitle: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
    opacity: 0.8,
  },
  upgradeBenefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING(1),
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.5),
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingVertical: SPACING(0.5),
    paddingHorizontal: SPACING(1),
    borderRadius: RADIUS.xs,
  },
  benefitText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  upgradeButton: {
    backgroundColor: COLORS.text,
    paddingVertical: SPACING(1.5),
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.surface,
    letterSpacing: 0.5,
  },

  // Pro Status Card
  proStatusCard: {
    backgroundColor: `${COLORS.secondary}15`,
    borderRadius: RADIUS.xl,
    padding: SPACING(2.5),
    gap: SPACING(1),
  },
  proStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1),
  },
  proStatusTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  proStatusText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },

  // Sections
  section: {
    ...MINIMAL_CARD,
    padding: 0,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    padding: SPACING(2.5),
    paddingBottom: SPACING(1.5),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING(2.5),
    paddingVertical: SPACING(2),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuItemPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING(2.5),
    paddingVertical: SPACING(2),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuItemPressed: {
    backgroundColor: COLORS.backgroundAlt,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1.5),
  },
  menuIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  menuValue: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  menuValueMuted: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '400',
  },

  // Demo Card
  demoCard: {
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: RADIUS.xl,
    padding: SPACING(2.5),
    gap: SPACING(1.5),
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1),
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  demoText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '400',
    lineHeight: 18,
  },
  demoButton: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING(1.25),
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  demoButtonPressed: {
    opacity: 0.9,
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  resetMessage: {
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING(1),
    backgroundColor: `${COLORS.danger}10`,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING(2),
  },
  logoutButtonPressed: {
    opacity: 0.8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.danger,
  },

  // Version
  version: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: SPACING(1),
  },

  // Level Section
  levelSection: {
    alignItems: 'flex-start',
  },

  // Achievements Section
  achievementsSection: {
    ...MINIMAL_CARD,
    padding: SPACING(2.5),
    gap: SPACING(2),
  },
  achievementsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1),
  },
  achievementsSectionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  achievementsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    backgroundColor: COLORS.backgroundAlt,
    paddingVertical: SPACING(0.5),
    paddingHorizontal: SPACING(1),
    borderRadius: RADIUS.full,
  },
  achievementsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING(1),
    padding: SPACING(3),
  },
  achievementsLoadingText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  achievementsEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING(1),
    padding: SPACING(3),
  },
  achievementsEmptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
    textAlign: 'center',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING(1.5),
  },
  achievementBadge: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING(1),
    gap: SPACING(0.5),
    position: 'relative',
  },
  achievementBadgeUnlocked: {
    backgroundColor: `${COLORS.secondary}15`,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
  },
  achievementBadgePressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  achievementIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIconWrapperUnlocked: {
    backgroundColor: COLORS.secondary,
  },
  achievementName: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 12,
  },
  achievementNameUnlocked: {
    color: COLORS.text,
    fontWeight: '700',
  },
  lockedOverlay: {
    position: 'absolute',
    top: SPACING(0.75),
    right: SPACING(0.75),
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING(3),
  },
  modalContent: {
    ...BRUTAL_CARD,
    width: '100%',
    maxWidth: 320,
    padding: SPACING(3),
    alignItems: 'center',
    gap: SPACING(2),
  },
  modalClose: {
    position: 'absolute',
    top: SPACING(1.5),
    right: SPACING(1.5),
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING(1),
  },
  modalIconWrapperUnlocked: {
    backgroundColor: COLORS.secondary,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalXPBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.5),
    backgroundColor: `${COLORS.secondary}20`,
    paddingVertical: SPACING(0.75),
    paddingHorizontal: SPACING(1.5),
    borderRadius: RADIUS.full,
  },
  modalXPText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  modalUnlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.75),
    paddingTop: SPACING(1),
  },
  modalUnlockedText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  modalLockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.75),
    paddingTop: SPACING(1),
  },
  modalLockedText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
});
