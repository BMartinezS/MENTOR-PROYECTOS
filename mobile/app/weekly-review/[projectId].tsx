import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, HelperText, Text, TextInput } from 'react-native-paper';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import Screen from '../components/Screen';
import SectionHeading from '../components/SectionHeading';
import { api } from '../../src/services/api';
import { WeeklyReview } from '../../src/types/models';

export default function WeeklyReviewScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();

  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions = useMemo(() => review?.questions ?? [], [review]);
  const suggestions = useMemo(() => review?.suggestions ?? [], [review]);

  const load = async () => {
    try {
      setError(null);
      const data = await api.weeklyReviews.latest(String(projectId));
      setReview(data);
      setAnswers(data.userAnswers ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la revisión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    void load();
  }, [projectId]);

  const submit = async () => {
    if (!review) return;

    try {
      setSubmitting(true);
      setError(null);
      await api.weeklyReviews.saveAnswers(review.id, { answers });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <SectionHeading title="Revisión semanal" subtitle="Reflexiona y ajusta tu plan" />
        {loading ? <Text>Cargando...</Text> : null}
        {error ? <HelperText type="error">{error}</HelperText> : null}

        {review?.summary ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">Resumen</Text>
              <Text style={styles.summary}>{review.summary}</Text>
            </Card.Content>
          </Card>
        ) : null}

        {suggestions.length ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">Sugerencias accionables</Text>
              {suggestions.map((suggestion) => (
                <Text key={suggestion} style={styles.listItem}>
                  • {suggestion}
                </Text>
              ))}
            </Card.Content>
          </Card>
        ) : null}

        {questions.length ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">Responde para cerrar la semana</Text>
              <View style={styles.questions}>
                {questions.map((question, index) => (
                  <View key={`${index}`} style={styles.questionBlock}>
                    <Text variant="titleSmall">{question}</Text>
                    <TextInput
                      value={answers[String(index)] ?? ''}
                      onChangeText={(text) => setAnswers((prev) => ({ ...prev, [String(index)]: text }))}
                      multiline
                      mode="outlined"
                      style={styles.input}
                    />
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        ) : null}

        <View style={styles.actions}>
          <Button mode="outlined" onPress={load}>
            Refrescar
          </Button>
          <Button mode="contained" onPress={submit} loading={submitting} disabled={submitting || !review}>
            Guardar
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING(2),
    paddingBottom: SPACING(4),
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
  },
  summary: {
    marginTop: SPACING(1),
    color: COLORS.text,
  },
  questions: {
    gap: SPACING(1.5),
  },
  questionBlock: {
    gap: SPACING(0.5),
  },
  input: {
    backgroundColor: COLORS.surface,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING(1),
  },
  listItem: {
    marginVertical: 4,
  },
});
