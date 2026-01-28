import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Chip, HelperText, Text } from 'react-native-paper';

import { useRouter } from 'expo-router';

import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import Screen from '../components/Screen';
import SectionHeading from '../components/SectionHeading';
import { useAuth } from '../contexts/AuthContext';
import { isMockApi } from '../services/api';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const details = useMemo(
    () => [
      { label: 'Email', value: user?.email },
      { label: 'Zona horaria', value: user?.timezone ?? 'No definida' },
      { label: 'Plan', value: user?.tier ?? 'Free' },
    ],
    [user]
  );

  const handleResetDemo = async () => {
    if (!isMockApi) return;
    const module = await import('../services/mockStore');
    module.resetMockStore();
    setResetMessage('Datos demo reiniciados. Reingresa para ver el estado inicial.');
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <Screen>
      <View style={styles.container}>
        <SectionHeading title="Perfil" subtitle="Administra tu cuenta y preferencias" />

        <Card style={styles.heroCard}>
          <Card.Content>
            <Text variant="headlineSmall">{user?.name ?? 'Usuario'}</Text>
            <Text style={styles.subtitle}>{user?.email}</Text>
            <Chip style={styles.planChip} textStyle={{ color: 'white' }}>
              {user?.tier ?? 'free'}
            </Chip>
          </Card.Content>
          <Card.Actions>
            <Button mode="outlined" onPress={logout} textColor={COLORS.danger}>
              Cerrar sesión
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            {details.map((item) => (
              <View key={item.label} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {isMockApi ? (
          <Card style={styles.banner}>
            <Card.Content>
              <Text variant="titleMedium">Modo demo activo</Text>
              <Text style={styles.bannerText}>
                Puedes regenerar los datos de prueba para volver al estado inicial del walkthrough.
              </Text>
              <Button mode="contained" onPress={handleResetDemo}>
                Reiniciar datos demo
              </Button>
              {resetMessage ? <HelperText type="info">{resetMessage}</HelperText> : null}
            </Card.Content>
          </Card>
        ) : null}

        <View style={styles.preferences}>
          <SectionHeading title="Notificaciones" subtitle="Próximamente" />
          <Text style={styles.helper}>Configura recordatorios inteligentes en el roadmap.</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING(2),
  },
  heroCard: {
    backgroundColor: COLORS.surface,
  },
  subtitle: {
    color: COLORS.textMuted,
  },
  planChip: {
    alignSelf: 'flex-start',
    marginTop: SPACING(1),
    backgroundColor: COLORS.primary,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING(1),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    color: COLORS.textMuted,
  },
  detailValue: {
    fontWeight: '600',
  },
  banner: {
    backgroundColor: COLORS.surfaceMuted,
  },
  bannerText: {
    color: COLORS.text,
    marginVertical: SPACING(1),
  },
  preferences: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING(2),
    gap: SPACING(1),
  },
  helper: {
    color: COLORS.textMuted,
  },
});
