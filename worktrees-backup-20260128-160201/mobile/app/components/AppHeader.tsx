import { StyleSheet, View } from 'react-native';
import { Avatar, IconButton, Text } from 'react-native-paper';

import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAuth } from '../contexts/AuthContext';

type Props = {
  onPrimaryAction?: () => void;
};

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
      <View>
        <Text variant="titleMedium" style={styles.greeting}>
          Hola {user?.name ?? 'emprendedor/a'},
        </Text>
        <Text style={styles.subtitle}>Hagamos avanzar tu proyecto 🚀</Text>
      </View>

      <View style={styles.actions}>
        {onPrimaryAction ? (
          <IconButton icon="plus" mode="contained-tonal" onPress={onPrimaryAction} />
        ) : null}
        <View style={styles.avatarWrapper}>
          <Avatar.Text size={44} label={initials} style={styles.avatar} color="white" />
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
    backgroundColor: COLORS.surfaceMuted,
    padding: SPACING(2),
    borderRadius: RADIUS.lg,
    marginBottom: SPACING(2),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  greeting: {
    color: COLORS.text,
  },
  subtitle: {
    color: COLORS.textMuted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  avatarWrapper: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 3,
  },
  avatar: {
    backgroundColor: COLORS.primary,
  },
});

