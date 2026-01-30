import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Plus } from 'lucide-react-native';

import { COLORS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';

type Props = {
  onPrimaryAction?: () => void;
};

/**
 * Minimalist AppHeader
 * - Clean, subtle design
 * - Warm greeting
 */
export default function AppHeader({ onPrimaryAction }: Props) {
  const { user } = useAuth();

  const initials = (user?.name || user?.email || 'MP')
    .split(' ')
    .map((part) => part.trim()[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>
          Hola, {user?.name ?? 'emprendedor'}
        </Text>
        <Text style={styles.subtitle}>¿Qué vas a lograr hoy?</Text>
      </View>

      <View style={styles.actions}>
        {onPrimaryAction && (
          <Pressable
            onPress={onPrimaryAction}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
          >
            <Plus size={22} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
        )}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING(1),
    marginBottom: SPACING(2),
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: SPACING(0.25),
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1.5),
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  addButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
