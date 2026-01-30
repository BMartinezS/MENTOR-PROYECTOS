import { Pressable, StyleSheet, View } from 'react-native';
import { Checkbox, Chip, IconButton, Text } from 'react-native-paper';

import { COLORS, SPACING } from '../../constants/theme';
import { Task } from '../../src/types/models';

type Props = {
  task: Task;
  onPress?: () => void;
  onToggleComplete?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  showActions?: boolean;
  canEdit?: boolean;
};

export default function TaskListItem({
  task,
  onPress,
  onToggleComplete,
  onEdit,
  onDelete,
  showActions = true,
  canEdit = true,
}: Props) {
  const status = task.status ?? 'pending';
  const isCompleted = status === 'completed';
  const statusColor =
    isCompleted
      ? COLORS.success
      : status === 'blocked'
        ? COLORS.danger
        : COLORS.secondary;

  const handleCheckboxPress = () => {
    if (onToggleComplete) {
      onToggleComplete(task);
    }
  };

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.row}>
        {showActions && onToggleComplete ? (
          <Checkbox
            status={isCompleted ? 'checked' : 'unchecked'}
            onPress={handleCheckboxPress}
            color={COLORS.success}
          />
        ) : null}
        <View style={styles.content}>
          <Text
            variant="titleSmall"
            style={[styles.title, isCompleted && styles.completedText]}
          >
            {task.title}
          </Text>
          {task.description ? (
            <Text style={[styles.secondary, isCompleted && styles.completedText]} numberOfLines={1}>
              {task.description}
            </Text>
          ) : null}
        </View>
        <Chip compact style={styles.chip} textStyle={{ color: statusColor }}>
          {status}
        </Chip>
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.metaRow}>
          {task.priority ? <Text style={styles.secondary}>Prioridad: {task.priority}</Text> : null}
          {task.dueDate ? <Text style={styles.secondary}>{task.dueDate}</Text> : null}
        </View>
        {showActions ? (
          <View style={styles.actionsRow}>
            {canEdit && onEdit ? (
              <IconButton
                icon="pencil"
                size={18}
                iconColor={COLORS.textMuted}
                onPress={() => onEdit(task)}
                style={styles.actionButton}
              />
            ) : null}
            {canEdit && onDelete ? (
              <IconButton
                icon="trash-can-outline"
                size={18}
                iconColor={COLORS.danger}
                onPress={() => onDelete(task)}
                style={styles.actionButton}
              />
            ) : null}
          </View>
        ) : null}
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
    gap: 8,
  },
  content: {
    flex: 1,
  },
  title: {
    color: COLORS.text,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  chip: {
    backgroundColor: COLORS.backgroundAlt,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    gap: SPACING(2),
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    margin: 0,
  },
  secondary: {
    color: COLORS.textMuted,
  },
});

