import { useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, TextInput as RNTextInput } from 'react-native';
import { Text } from 'react-native-paper';

import { Link } from 'expo-router';

import { COLORS, RADIUS, SPACING, SHADOWS, MINIMAL_CARD, MINIMAL_INPUT } from '../../constants/theme';
import Screen from '../components/Screen';
import { useAuth } from '../../src/contexts/AuthContext';

/**
 * Minimalist Register Screen
 * - Clean, focused design
 * - Soft shadows
 * - Generous whitespace
 */
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero section */}
        <View style={styles.hero}>
          <View style={styles.logoWrapper}>
            <Text style={styles.logoText}>M</Text>
          </View>
          <Text style={styles.heroTitle}>Comienza tu travesía</Text>
          <Text style={styles.heroSubtitle}>
            Crea un plan claro con IA y mantén el foco
          </Text>
        </View>

        {/* Register card */}
        <View style={styles.card}>
          {/* Name input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre</Text>
            <RNTextInput
              placeholder="Tu nombre"
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          {/* Email input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <RNTextInput
              placeholder="tu@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          {/* Password input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <RNTextInput
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit button */}
          <Pressable
            onPress={onSubmit}
            disabled={submitting}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.submitButtonPressed,
              submitting && styles.submitButtonDisabled,
            ]}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Registrando...' : 'Crear cuenta'}
            </Text>
          </Pressable>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
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
    paddingHorizontal: SPACING(3),
    paddingVertical: SPACING(4),
  },
  hero: {
    alignItems: 'center',
    marginBottom: SPACING(4),
    marginTop: SPACING(2),
  },
  logoWrapper: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING(2),
    ...SHADOWS.lg,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING(0.5),
  },
  heroSubtitle: {
    color: COLORS.textMuted,
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    ...MINIMAL_CARD,
    padding: SPACING(3),
    gap: SPACING(2.5),
  },
  inputGroup: {
    gap: SPACING(0.75),
  },
  inputLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    ...MINIMAL_INPUT,
    paddingVertical: SPACING(1.75),
    paddingHorizontal: SPACING(2),
    fontSize: 16,
    color: COLORS.text,
  },
  errorContainer: {
    backgroundColor: `${COLORS.danger}10`,
    padding: SPACING(1.5),
    borderRadius: RADIUS.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING(2),
    borderRadius: RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  submitButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING(0.75),
    justifyContent: 'center',
    marginTop: SPACING(1),
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  link: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
