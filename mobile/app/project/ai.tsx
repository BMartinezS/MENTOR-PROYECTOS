import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, HelperText, Text, TextInput } from 'react-native-paper';

import { useRouter } from 'expo-router';

import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import Screen from '../components/Screen';
import SectionHeading from '../components/SectionHeading';
import { api } from '../../src/services/api';

export default function CreateProjectAiScreen() {
  const router = useRouter();

  const [idea, setIdea] = useState('');
  const [hours, setHours] = useState('10');
  const [targetDate, setTargetDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const availableHoursPerWeek = Number(hours);
      const result = await api.projects.createWithAI({
        idea: idea.trim(),
        availableHoursPerWeek: Number.isFinite(availableHoursPerWeek) ? availableHoursPerWeek : 10,
        targetDate: targetDate.trim(),
      });

      const id = result.project?.id ?? (result as any).id;
      if (id) {
        router.replace(`/project/${id}`);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo generar el plan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen padded={false}>
      <View style={styles.wrapper}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <SectionHeading title="Generar plan con IA" subtitle="Describe tu idea y disponibilidad" />

          <View style={styles.card}>
            <Text style={styles.helper}>
              Entre más contexto incluyas (audiencia, entregables, fechas), más preciso será el plan.
            </Text>

            <TextInput
              label="¿Qué quieres lograr?"
              value={idea}
              onChangeText={setIdea}
              multiline
              mode="outlined"
              style={styles.input}
              disabled={submitting}
            />
            <TextInput
              label="Horas disponibles por semana"
              value={hours}
              onChangeText={setHours}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              disabled={submitting}
            />
            <TextInput
              label="Fecha objetivo (YYYY-MM-DD)"
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="2026-03-16"
              mode="outlined"
              style={styles.input}
              disabled={submitting}
            />

            {error ? <HelperText type="error">{error}</HelperText> : null}

            <Button mode="contained" onPress={onSubmit} loading={submitting} disabled={submitting}>
              Generar plan
            </Button>
          </View>
        </ScrollView>

        {submitting ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator animating size="large" />
            <Text style={styles.loadingText}>Generando plan con IA…</Text>
            <Text style={styles.loadingHint}>Esto puede tardar hasta 40 segundos.</Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING(3),
    gap: SPACING(2),
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING(3),
    gap: SPACING(1.5),
  },
  helper: {
    color: COLORS.textMuted,
  },
  input: {
    backgroundColor: COLORS.surface,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 3, 18, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING(3),
  },
  loadingText: {
    marginTop: SPACING(2),
    color: COLORS.text,
    fontWeight: '600',
  },
  loadingHint: {
    marginTop: SPACING(1),
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
