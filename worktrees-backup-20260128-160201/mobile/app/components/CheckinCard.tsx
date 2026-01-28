import { StyleSheet, View, Animated } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { MessageSquare, CheckCircle, XCircle, FolderOpen, AlertCircle } from 'lucide-react-native';

import { COLORS, RADIUS, SHADOWS, SPACING, ACCESSIBILITY } from '../../constants/theme';
import { Checkin } from '../types/models';
import { usePressAnimation } from '../utils/animationsSimple';

type Props = {
  checkin: Checkin;
  onRespond: (completed: boolean) => void;
};

export default function CheckinCard({ checkin, onRespond }: Props) {
  const getPriorityColor = () => {
    // You can extend this logic based on checkin priority if available
    return COLORS.secondary;
  };

  const noAnimation = usePressAnimation(() => onRespond(false));
  const yesAnimation = usePressAnimation(() => onRespond(true));

  return (
    <View style={[styles.card, { borderLeftColor: getPriorityColor(), borderLeftWidth: 4 }]}>
      <View style={styles.header}>
        <View style={styles.projectRow}>
          <FolderOpen size={16} color={COLORS.textMuted} />
          <Text style={styles.project}>{checkin.Project?.title ?? 'Proyecto'}</Text>
        </View>
        <AlertCircle size={20} color={getPriorityColor()} />
      </View>

      <View style={styles.messageRow}>
        <MessageSquare size={20} color={COLORS.primary} style={styles.messageIcon} />
        <Text variant="titleMedium" style={styles.message}>
          {checkin.message}
        </Text>
      </View>

      <View style={styles.actions}>
        <Animated.View style={[styles.actionButton, noAnimation.animatedStyle]}>
          <Button
            mode="outlined"
            onPressIn={noAnimation.onPressIn}
            onPressOut={noAnimation.onPressOut}
            textColor={COLORS.danger}
            icon={() => <XCircle size={18} color={COLORS.danger} />}
            style={{ minHeight: ACCESSIBILITY.minTouchTarget }}
            accessibilityLabel="Marcar como no completado"
          >
            No pude
          </Button>
        </Animated.View>

        <Animated.View style={[styles.actionButton, yesAnimation.animatedStyle]}>
          <Button
            mode="contained"
            onPressIn={yesAnimation.onPressIn}
            onPressOut={yesAnimation.onPressOut}
            icon={() => <CheckCircle size={18} color={COLORS.text} />}
            style={{ minHeight: ACCESSIBILITY.minTouchTarget }}
            accessibilityLabel="Marcar como completado"
          >
            Sí, lo hice
          </Button>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING(2),
    marginBottom: SPACING(2),
    ...SHADOWS.card,
    gap: SPACING(1.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.5),
  },
  project: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING(1),
  },
  messageIcon: {
    marginTop: 2, // Align with text baseline
  },
  message: {
    color: COLORS.text,
    flex: 1,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING(1),
    marginTop: SPACING(0.5),
  },
  actionButton: {
    flex: 1,
  },
});

