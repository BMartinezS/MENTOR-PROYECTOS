import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

import { useRouter } from 'expo-router';

import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import Screen from '../components/Screen';

export default function NewProjectScreen() {
  const router = useRouter();

  return (
    <Screen>
      <Text variant="headlineSmall" style={styles.title}>
        Crear proyecto
      </Text>

      <View style={styles.grid}>
        <Card style={styles.card}>
          <Card.Title title="Manual" subtitle="Define título y fecha" titleStyle={styles.cardTitle} subtitleStyle={styles.subtitle} />
          <Card.Content>
            <Text style={styles.secondary}>Ideal si ya tienes el plan claro.</Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={() => router.push('/project/manual')}>
              Empezar
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Con IA" subtitle="Genera plan automáticamente" titleStyle={styles.cardTitle} subtitleStyle={styles.subtitle} />
          <Card.Content>
            <Text style={styles.secondary}>
              Describe tu idea, tu disponibilidad y la fecha objetivo.
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={() => router.push('/project/ai')}>
              Generar
            </Button>
          </Card.Actions>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: SPACING(2),
    color: COLORS.text,
  },
  grid: {
    gap: SPACING(2),
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  cardTitle: {
    color: COLORS.text,
  },
  subtitle: {
    color: COLORS.textMuted,
  },
  secondary: {
    color: COLORS.text,
  },
});

