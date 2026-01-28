import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import { Link } from 'expo-router';

import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import Screen from '../components/Screen';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen() {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await register(email.trim(), password, name.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo registrar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.badge}>Mentor Proyectos</Text>
          <Text variant="displaySmall" style={styles.heroTitle}>
            Comienza tu travesía 💡
          </Text>
          <Text style={styles.heroSubtitle}>Crea un plan claro con IA y accountability.</Text>
        </View>

        <View style={styles.card}>
          <Text variant="titleLarge">Crear cuenta</Text>
          <Text style={styles.cardSubtitle}>Registra tus datos para comenzar.</Text>

          <TextInput label="Nombre" value={name} onChangeText={setName} style={styles.input} />
          <TextInput
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            label="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          {error ? <HelperText type="error">{error}</HelperText> : null}

          <Button mode="contained" onPress={onSubmit} loading={submitting} disabled={submitting}>
            Registrarme
          </Button>

          <View style={styles.footer}>
            <Text style={styles.secondary}>¿Ya tienes cuenta?</Text>
            <Link href="/(auth)/login" style={styles.link}>
              Iniciar sesión
            </Link>
          </View>
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
  hero: {
    gap: SPACING(1),
    marginTop: SPACING(2),
  },
  badge: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  heroTitle: {
    color: COLORS.text,
  },
  heroSubtitle: {
    color: COLORS.textMuted,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING(3),
    gap: SPACING(1),
  },
  cardSubtitle: {
    color: COLORS.textMuted,
  },
  input: {
    backgroundColor: COLORS.surface,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING(1),
    marginTop: SPACING(1),
  },
  secondary: {
    color: COLORS.textMuted,
  },
  link: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
