import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import { useRouter } from 'expo-router';

import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import Screen from '../components/Screen';
import SectionHeading from '../components/SectionHeading';
import { api } from '../services/api';

export default function CreateProjectManualScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const project = await api.projects.create({
        title: title.trim(),
        description: description.trim() ? description.trim() : undefined,
        targetDate: targetDate.trim() ? targetDate.trim() : undefined,
      });

      router.replace(`/project/${project.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear el proyecto');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SectionHeading title="Crear proyecto" subtitle="Define manualmente tu plan" />

        <View style={styles.card}>
          <Text style={styles.helper}>Detalla la información base. Luego podrás añadir tareas, fases y objetivos.</Text>

          <TextInput label="Título" value={title} onChangeText={setTitle} style={styles.input} mode="outlined" />
          <TextInput
            label="Descripción"
            value={description}
            onChangeText={setDescription}
            multiline
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Fecha objetivo (YYYY-MM-DD)"
            value={targetDate}
            onChangeText={setTargetDate}
            placeholder="2026-03-16"
            style={styles.input}
            mode="outlined"
          />

          {error ? <HelperText type="error">{error}</HelperText> : null}

          <Button mode="contained" onPress={onSubmit} loading={submitting} disabled={submitting}>
            Crear proyecto
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
});
