import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MessageSquare, CheckCircle, XCircle, FolderOpen } from 'lucide-react-native';

import { COLORS, RADIUS, SHADOWS, SPACING, MINIMAL_CARD, ACCESSIBILITY } from '../../constants/theme';
import { Checkin } from '../../src/types/models';

type Props = {
  checkin: Checkin;
  onRespond: (completed: boolean) => void;
};

/**
 * Minimalist CheckinCard
 * - Clean white card with subtle shadow
 * - Soft button colors
 * - Generous whitespace
 */
export default function CheckinCard({ checkin, onRespond }: Props) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.projectRow}>
          <FolderOpen size={16} color={COLORS.textMuted} />
          <Text style={styles.project}>{checkin.Project?.title ?? 'Proyecto'}</Text>
        </View>
      </View>

      {/* Message */}
      <View style={styles.messageRow}>
        <View style={styles.messageIconWrapper}>
          <MessageSquare size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.message}>{checkin.message}</Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => onRespond(false)}
          style={({ pressed }) => [
            styles.button,
            styles.buttonNo,
            pressed && styles.buttonPressed,
          ]}
          accessibilityLabel="Marcar como no completado"
        >
          <XCircle size={18} color={COLORS.danger} />
          <Text style={[styles.buttonText, { color: COLORS.danger }]}>No pude</Text>
        </Pressable>

        <Pressable
          onPress={() => onRespond(true)}
          style={({ pressed }) => [
            styles.button,
            styles.buttonYes,
            pressed && styles.buttonPressed,
          ]}
          accessibilityLabel="Marcar como completado"
        >
          <CheckCircle size={18} color="#FFFFFF" />
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Sí, lo hice</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...MINIMAL_CARD,
    padding: SPACING(2.5),
    marginBottom: SPACING(2),
  },
  header: {
    marginBottom: SPACING(1.5),
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.75),
  },
  project: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING(1.5),
    marginBottom: SPACING(2.5),
  },
  messageIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  message: {
    color: COLORS.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING(1.5),
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING(0.75),
    paddingVertical: SPACING(1.5),
    borderRadius: RADIUS.md,
    minHeight: ACCESSIBILITY.minTouchTarget,
  },
  buttonNo: {
    backgroundColor: `${COLORS.danger}10`,
  },
  buttonYes: {
    backgroundColor: COLORS.secondary,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
