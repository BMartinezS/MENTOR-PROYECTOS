import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Alert, Pressable, Switch, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import {
  Bell,
  BellOff,
  BellRing,
  Settings,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Clock,
  Users,
  Target,
  Send,
  RefreshCw,
  XCircle,
} from 'lucide-react-native';

import { COLORS, SPACING, RADIUS, SHADOWS, MINIMAL_CARD } from '../../constants/theme';
import Screen from '../components/Screen';
import { useNotifications } from '../../src/contexts/NotificationContext';

/**
 * Minimalist Notifications Screen
 * - Clean status indicators
 * - Subtle preference toggles
 * - Soft shadows and rounded corners
 */
export default function NotificationsScreen() {
  const {
    isInitialized,
    isRegistered,
    pushToken,
    stats,
    preferences,
    hasPermissions,
    loading,
    initializeNotifications,
    requestPermissions,
    registerDevice,
    unregisterDevice,
    refreshStats,
    updatePreferences,
    sendTestNotification,
  } = useNotifications();

  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    if (!isInitialized) {
      initializeNotifications();
    } else {
      refreshStats();
    }
  }, [isInitialized]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshStats();
    } finally {
      setRefreshing(false);
    }
  };

  const handlePermissionRequest = async () => {
    try {
      const granted = await requestPermissions();
      if (granted) {
        Alert.alert('Permisos concedidos', 'Las notificaciones están habilitadas.');
      } else {
        Alert.alert(
          'Permisos denegados',
          'No podrás recibir notificaciones. Habilítalas desde configuración del sistema.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron solicitar permisos.');
    }
  };

  const handleRegisterDevice = async () => {
    try {
      await registerDevice();
      Alert.alert('Dispositivo registrado', 'Ahora recibirás notificaciones push.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el dispositivo.');
    }
  };

  const handleUnregisterDevice = () => {
    Alert.alert(
      'Desactivar notificaciones',
      '¿Dejarás de recibir todas las notificaciones. ¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: async () => {
            try {
              await unregisterDevice();
              Alert.alert('Notificaciones desactivadas', 'Ya no recibirás notificaciones push.');
            } catch (error) {
              Alert.alert('Error', 'No se pudieron desactivar.');
            }
          },
        },
      ]
    );
  };

  const handlePreferenceChange = async (key: keyof typeof localPreferences, value: boolean | string) => {
    if (!localPreferences) return;

    const newPreferences = { ...localPreferences, [key]: value };
    setLocalPreferences(newPreferences);

    try {
      await updatePreferences({ [key]: value });
    } catch (error) {
      setLocalPreferences(localPreferences);
      Alert.alert('Error', 'No se pudo actualizar la preferencia.');
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('Notificación enviada', 'Deberías recibirla en unos momentos.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la notificación de prueba.');
    }
  };

  const getStatusConfig = () => {
    if (!hasPermissions) {
      return {
        icon: BellOff,
        text: 'Sin permisos',
        color: COLORS.danger,
        bgColor: `${COLORS.danger}15`,
      };
    }
    if (!isRegistered) {
      return {
        icon: AlertTriangle,
        text: 'No registrado',
        color: COLORS.warning,
        bgColor: `${COLORS.warning}15`,
      };
    }
    return {
      icon: CheckCircle,
      text: 'Activo',
      color: COLORS.secondary,
      bgColor: `${COLORS.secondary}15`,
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  if (loading.initializing) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIconWrapper}>
            <Bell size={28} color={COLORS.primary} />
          </View>
          <Text style={styles.loadingText}>Inicializando...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Alertas</Text>
          <Text style={styles.headerSubtitle}>Configura cuándo y cómo te recordamos</Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIconWrapper, { backgroundColor: statusConfig.bgColor }]}>
              <StatusIcon size={22} color={statusConfig.color} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Estado</Text>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.text}</Text>
            </View>
          </View>

          {/* Stats */}
          {stats && (
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Target size={18} color={COLORS.primary} />
                <Text style={styles.statValue}>{stats.activeProjects}</Text>
                <Text style={styles.statLabel}>Proyectos</Text>
              </View>
              <View style={styles.statCard}>
                <AlertTriangle size={18} color={COLORS.danger} />
                <Text style={styles.statValue}>{stats.urgentTasks}</Text>
                <Text style={styles.statLabel}>Urgentes</Text>
              </View>
              <View style={styles.statCard}>
                <Clock size={18} color={COLORS.secondary} />
                <Text style={styles.statValue}>{stats.nextReminderTime || '--'}</Text>
                <Text style={styles.statLabel}>Próximo</Text>
              </View>
            </View>
          )}
        </View>

        {/* Setup Section (if not configured) */}
        {(!hasPermissions || !isRegistered) && (
          <View style={styles.setupCard}>
            <View style={styles.setupHeader}>
              <View style={styles.setupIconWrapper}>
                <Settings size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.setupTitle}>Configuración inicial</Text>
            </View>
            <Text style={styles.setupText}>
              Activa las notificaciones para recibir recordatorios de tus proyectos.
            </Text>

            {!hasPermissions && (
              <Pressable
                onPress={handlePermissionRequest}
                style={({ pressed }) => [
                  styles.setupButton,
                  pressed && styles.setupButtonPressed,
                ]}
              >
                <Bell size={18} color="#FFFFFF" />
                <Text style={styles.setupButtonText}>Solicitar permisos</Text>
              </Pressable>
            )}

            {hasPermissions && !isRegistered && (
              <Pressable
                onPress={handleRegisterDevice}
                disabled={loading.registering}
                style={({ pressed }) => [
                  styles.setupButton,
                  { backgroundColor: COLORS.secondary },
                  pressed && styles.setupButtonPressed,
                  loading.registering && styles.buttonDisabled,
                ]}
              >
                <Smartphone size={18} color="#FFFFFF" />
                <Text style={styles.setupButtonText}>
                  {loading.registering ? 'Registrando...' : 'Registrar dispositivo'}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Preferences Section */}
        {isRegistered && localPreferences && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferencias</Text>

            <PreferenceToggle
              icon={BellRing}
              iconColor={COLORS.primary}
              title="Recordatorios diarios"
              description="Recordatorio cada mañana sobre tareas pendientes"
              value={localPreferences.dailyReminders}
              onValueChange={(value) => handlePreferenceChange('dailyReminders', value)}
              disabled={loading.updating}
            />

            <PreferenceToggle
              icon={TrendingUp}
              iconColor={COLORS.secondary}
              title="Recordatorios de progreso"
              description="Te avisamos si no has avanzado en tus proyectos"
              value={localPreferences.progressReminders}
              onValueChange={(value) => handlePreferenceChange('progressReminders', value)}
              disabled={loading.updating}
            />

            <PreferenceToggle
              icon={Calendar}
              iconColor={COLORS.tertiary}
              title="Revisión semanal"
              description="Resumen de tu productividad cada domingo"
              value={localPreferences.weeklyReview}
              onValueChange={(value) => handlePreferenceChange('weeklyReview', value)}
              disabled={loading.updating}
            />

            <PreferenceToggle
              icon={AlertTriangle}
              iconColor={COLORS.danger}
              title="Alertas de deadlines"
              description="Notificaciones urgentes para fechas límite"
              value={localPreferences.deadlineAlerts}
              onValueChange={(value) => handlePreferenceChange('deadlineAlerts', value)}
              disabled={loading.updating}
            />

            <PreferenceToggle
              icon={Users}
              iconColor="#A06CD5"
              title="Notificaciones de equipo"
              description="Invitaciones a proyectos y colaboraciones"
              value={localPreferences.teamNotifications}
              onValueChange={(value) => handlePreferenceChange('teamNotifications', value)}
              disabled={loading.updating}
            />
          </View>
        )}

        {/* Actions Section */}
        {isRegistered && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acciones</Text>

            <View style={styles.actionsRow}>
              <Pressable
                onPress={handleTestNotification}
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.actionButtonPressed,
                ]}
              >
                <Send size={18} color={COLORS.primary} />
                <Text style={styles.actionButtonText}>Probar</Text>
              </Pressable>

              <Pressable
                onPress={refreshStats}
                disabled={loading.refreshing}
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.actionButtonPressed,
                  loading.refreshing && styles.buttonDisabled,
                ]}
              >
                <RefreshCw size={18} color={COLORS.primary} />
                <Text style={styles.actionButtonText}>
                  {loading.refreshing ? '...' : 'Actualizar'}
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={handleUnregisterDevice}
              style={({ pressed }) => [
                styles.disableButton,
                pressed && styles.disableButtonPressed,
              ]}
            >
              <XCircle size={18} color={COLORS.danger} />
              <Text style={styles.disableButtonText}>Desactivar notificaciones</Text>
            </Pressable>
          </View>
        )}

        {/* Debug Info */}
        {__DEV__ && pushToken && (
          <View style={styles.debugCard}>
            <Text style={styles.debugTitle}>Debug info</Text>
            <Text style={styles.debugText} numberOfLines={2}>
              Token: {pushToken}
            </Text>
            <Text style={styles.debugText}>
              Registrado: {isRegistered ? 'Sí' : 'No'} | Permisos: {hasPermissions ? 'Sí' : 'No'}
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

/**
 * Preference toggle component with minimalist styling
 */
interface PreferenceToggleProps {
  icon: any;
  iconColor: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

function PreferenceToggle({
  icon: Icon,
  iconColor,
  title,
  description,
  value,
  onValueChange,
  disabled,
}: PreferenceToggleProps) {
  return (
    <View style={styles.preferenceItem}>
      <View style={[styles.preferenceIcon, { backgroundColor: `${iconColor}15` }]}>
        <Icon size={18} color={iconColor} />
      </View>
      <View style={styles.preferenceInfo}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: COLORS.backgroundAlt, true: `${COLORS.secondary}60` }}
        thumbColor={value ? COLORS.secondary : COLORS.surface}
        ios_backgroundColor={COLORS.backgroundAlt}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING(2.5),
    paddingVertical: SPACING(3),
    gap: SPACING(2.5),
    paddingBottom: SPACING(4),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING(2),
  },
  loadingIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.xl,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },

  // Header
  header: {
    marginBottom: SPACING(0.5),
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
    marginTop: SPACING(0.5),
  },

  // Status Card
  statusCard: {
    ...MINIMAL_CARD,
    padding: SPACING(2.5),
    gap: SPACING(2.5),
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1.5),
  },
  statusIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING(1.5),
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: RADIUS.lg,
    padding: SPACING(2),
    alignItems: 'center',
    gap: SPACING(0.5),
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
  },

  // Setup Card
  setupCard: {
    backgroundColor: `${COLORS.primary}08`,
    borderRadius: RADIUS.xl,
    padding: SPACING(2.5),
    gap: SPACING(2),
  },
  setupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1),
  },
  setupIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  setupText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
    lineHeight: 20,
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING(1),
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING(1.75),
    ...SHADOWS.sm,
  },
  setupButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  setupButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Section
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

  // Preference Item
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING(2.5),
    paddingVertical: SPACING(2),
    gap: SPACING(1.5),
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceInfo: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  preferenceDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '400',
    marginTop: 2,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING(1.5),
    padding: SPACING(2.5),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING(0.75),
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING(1.5),
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  disableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING(1),
    paddingVertical: SPACING(2),
    marginHorizontal: SPACING(2.5),
    marginBottom: SPACING(2.5),
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  disableButtonPressed: {
    opacity: 0.7,
  },
  disableButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.danger,
  },

  // Debug Card
  debugCard: {
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: RADIUS.md,
    padding: SPACING(2),
    gap: SPACING(0.5),
    opacity: 0.7,
  },
  debugTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  debugText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '400',
    fontFamily: 'monospace',
  },
});
