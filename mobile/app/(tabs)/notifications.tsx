import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Text, Switch, Button, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { Bell, BellOff, Settings, Smartphone, CheckCircle, AlertTriangle } from 'lucide-react-native';

import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import Screen from '../components/Screen';
import SectionHeading from '../components/SectionHeading';
import { useNotifications } from '../contexts/NotificationContext';

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

  const handlePermissionRequest = async () => {
    try {
      const granted = await requestPermissions();
      if (granted) {
        Alert.alert('✅ Permisos concedidos', 'Las notificaciones están habilitadas.');
      } else {
        Alert.alert(
          '❌ Permisos denegados',
          'No podrás recibir notificaciones. Puedes habilitarlas desde la configuración del sistema.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron solicitar permisos de notificación.');
    }
  };

  const handleRegisterDevice = async () => {
    try {
      await registerDevice();
      Alert.alert('✅ Dispositivo registrado', 'Ahora recibirás notificaciones push.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el dispositivo para notificaciones.');
    }
  };

  const handleUnregisterDevice = () => {
    Alert.alert(
      '⚠️ Desactivar notificaciones',
      'Dejarás de recibir todas las notificaciones push. ¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: async () => {
            try {
              await unregisterDevice();
              Alert.alert('✅ Notificaciones desactivadas', 'Ya no recibirás notificaciones push.');
            } catch (error) {
              Alert.alert('Error', 'No se pudieron desactivar las notificaciones.');
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
      // Revert local change on error
      setLocalPreferences(localPreferences);
      Alert.alert('Error', 'No se pudo actualizar la preferencia.');
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('🧪 Notificación de prueba enviada', 'Deberías recibirla en unos momentos.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la notificación de prueba.');
    }
  };

  const getStatusIcon = () => {
    if (!hasPermissions) return <BellOff size={20} color={COLORS.danger} />;
    if (!isRegistered) return <AlertTriangle size={20} color={COLORS.warning} />;
    return <CheckCircle size={20} color={COLORS.success} />;
  };

  const getStatusText = () => {
    if (!hasPermissions) return 'Sin permisos';
    if (!isRegistered) return 'No registrado';
    return 'Activo';
  };

  const getStatusColor = () => {
    if (!hasPermissions) return COLORS.danger;
    if (!isRegistered) return COLORS.warning;
    return COLORS.success;
  };

  if (loading.initializing) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Inicializando notificaciones...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Bell size={32} color={COLORS.primary} />
          <Text variant="headlineSmall" style={styles.title}>
            Notificaciones
          </Text>
          <Text style={styles.subtitle}>
            Configura cuándo y cómo quieres que te recordemos
          </Text>
        </View>

        {/* Status Card */}
        <Card style={styles.statusCard}>
          <Card.Content style={styles.statusContent}>
            <View style={styles.statusRow}>
              {getStatusIcon()}
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>Estado de notificaciones</Text>
                <Chip
                  style={[styles.statusChip, { backgroundColor: getStatusColor() + '20' }]}
                  textStyle={{ color: getStatusColor(), fontWeight: '600' }}
                >
                  {getStatusText()}
                </Chip>
              </View>
            </View>

            {stats && (
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.activeProjects}</Text>
                  <Text style={styles.statLabel}>Proyectos activos</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.urgentTasks}</Text>
                  <Text style={styles.statLabel}>Tareas urgentes</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.nextReminderTime}</Text>
                  <Text style={styles.statLabel}>Próximo recordatorio</Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Setup Section */}
        {(!hasPermissions || !isRegistered) && (
          <View style={styles.section}>
            <SectionHeading title="Configuración inicial" subtitle="Activa las notificaciones" />

            {!hasPermissions && (
              <Button
                mode="contained"
                onPress={handlePermissionRequest}
                style={styles.actionButton}
                icon={({ size, color }) => <Settings size={size} color={color} />}
              >
                Solicitar permisos
              </Button>
            )}

            {hasPermissions && !isRegistered && (
              <Button
                mode="contained"
                onPress={handleRegisterDevice}
                loading={loading.registering}
                style={styles.actionButton}
                icon={({ size, color }) => <Smartphone size={size} color={color} />}
              >
                Registrar dispositivo
              </Button>
            )}
          </View>
        )}

        {/* Preferences Section */}
        {isRegistered && localPreferences && (
          <View style={styles.section}>
            <SectionHeading title="Preferencias" subtitle="Personaliza tus notificaciones" />

            <View style={styles.preferencesList}>
              <View style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                  <Text style={styles.preferenceTitle}>Recordatorios diarios</Text>
                  <Text style={styles.preferenceDescription}>
                    Recordatorio cada mañana sobre tareas pendientes
                  </Text>
                </View>
                <Switch
                  value={localPreferences.dailyReminders}
                  onValueChange={(value) => handlePreferenceChange('dailyReminders', value)}
                  disabled={loading.updating}
                />
              </View>

              <View style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                  <Text style={styles.preferenceTitle}>Recordatorios de progreso</Text>
                  <Text style={styles.preferenceDescription}>
                    Te avisamos si no has avanzado en tus proyectos
                  </Text>
                </View>
                <Switch
                  value={localPreferences.progressReminders}
                  onValueChange={(value) => handlePreferenceChange('progressReminders', value)}
                  disabled={loading.updating}
                />
              </View>

              <View style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                  <Text style={styles.preferenceTitle}>Revisión semanal</Text>
                  <Text style={styles.preferenceDescription}>
                    Resumen de tu productividad cada domingo
                  </Text>
                </View>
                <Switch
                  value={localPreferences.weeklyReview}
                  onValueChange={(value) => handlePreferenceChange('weeklyReview', value)}
                  disabled={loading.updating}
                />
              </View>

              <View style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                  <Text style={styles.preferenceTitle}>Alertas de deadlines</Text>
                  <Text style={styles.preferenceDescription}>
                    Notificaciones urgentes para fechas límite
                  </Text>
                </View>
                <Switch
                  value={localPreferences.deadlineAlerts}
                  onValueChange={(value) => handlePreferenceChange('deadlineAlerts', value)}
                  disabled={loading.updating}
                />
              </View>

              <View style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                  <Text style={styles.preferenceTitle}>Notificaciones de equipo</Text>
                  <Text style={styles.preferenceDescription}>
                    Invitaciones a proyectos y colaboraciones
                  </Text>
                </View>
                <Switch
                  value={localPreferences.teamNotifications}
                  onValueChange={(value) => handlePreferenceChange('teamNotifications', value)}
                  disabled={loading.updating}
                />
              </View>
            </View>
          </View>
        )}

        {/* Actions Section */}
        {isRegistered && (
          <View style={styles.section}>
            <SectionHeading title="Acciones" subtitle="Pruebas y configuración" />

            <View style={styles.actionsRow}>
              <Button
                mode="outlined"
                onPress={handleTestNotification}
                style={styles.actionButton}
                icon={({ size, color }) => <Bell size={size} color={color} />}
              >
                Prueba
              </Button>

              <Button
                mode="outlined"
                onPress={refreshStats}
                loading={loading.refreshing}
                style={styles.actionButton}
                icon={({ size, color }) => <Settings size={size} color={color} />}
              >
                Actualizar
              </Button>
            </View>

            <Button
              mode="text"
              onPress={handleUnregisterDevice}
              style={styles.dangerButton}
              textColor={COLORS.danger}
            >
              Desactivar notificaciones
            </Button>
          </View>
        )}

        {/* Debug Info */}
        {__DEV__ && pushToken && (
          <View style={styles.debugSection}>
            <Text style={styles.debugTitle}>Debug Info</Text>
            <Text style={styles.debugText} numberOfLines={3}>
              Token: {pushToken}
            </Text>
            <Text style={styles.debugText}>
              Registrado: {isRegistered ? 'Sí' : 'No'}
            </Text>
            <Text style={styles.debugText}>
              Permisos: {hasPermissions ? 'Sí' : 'No'}
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING(2),
    gap: SPACING(3),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING(2),
  },
  loadingText: {
    color: COLORS.textMuted,
  },
  header: {
    alignItems: 'center',
    gap: SPACING(1),
    marginBottom: SPACING(2),
  },
  title: {
    color: COLORS.text,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: COLORS.surfaceGlass,
    borderRadius: RADIUS.lg,
  },
  statusContent: {
    gap: SPACING(2),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1.5),
  },
  statusInfo: {
    flex: 1,
    gap: SPACING(0.5),
  },
  statusTitle: {
    color: COLORS.text,
    fontWeight: '600',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING(1),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
    gap: SPACING(0.5),
  },
  statValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    gap: SPACING(1.5),
  },
  actionButton: {
    borderRadius: RADIUS.md,
  },
  preferencesList: {
    gap: SPACING(2),
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING(1),
    paddingHorizontal: SPACING(1.5),
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
  },
  preferenceInfo: {
    flex: 1,
    gap: SPACING(0.5),
    marginRight: SPACING(2),
  },
  preferenceTitle: {
    color: COLORS.text,
    fontWeight: '600',
  },
  preferenceDescription: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING(1.5),
  },
  dangerButton: {
    marginTop: SPACING(1),
  },
  debugSection: {
    marginTop: SPACING(2),
    padding: SPACING(1.5),
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    opacity: 0.7,
  },
  debugTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: SPACING(0.5),
  },
  debugText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
