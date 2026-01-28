import { Pressable, StyleSheet, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';

import { COLORS, SPACING } from '../../constants/theme';
import { Task } from '../types/models';

type Props = {
  task: Task;
  onPress?: () => void;
};

export default function TaskListItem({ task, onPress }: Props) {
  const status = task.status ?? 'pending';
  const statusColor =
    status === 'completed'
      ? COLORS.success
      : status === 'blocked'
        ? COLORS.danger
        : COLORS.secondary;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text variant="titleSmall" style={styles.title}>
            {task.title}
          </Text>
          {task.description ? (
            <Text style={styles.secondary} numberOfLines={1}>
              {task.description}
            </Text>
          ) : null}
        </View>
        <Chip compact style={styles.chip} textStyle={{ color: statusColor }}>
          {status}
        </Chip>
      </View>
      <View style={styles.metaRow}>
        {task.priority ? <Text style={styles.secondary}>Prioridad: {task.priority}</Text> : null}
        {task.dueDate ? <Text style={styles.secondary}>{task.dueDate}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING(1.5),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: COLORS.text,
  },
  chip: {
    backgroundColor: COLORS.surfaceMuted,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondary: {
    color: COLORS.textMuted,
  },
});

