import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Wrapper for haptic feedback that handles platform availability
class HapticManager {
  private isAvailable: boolean = Platform.OS === 'ios' || Platform.OS === 'android';

  // Light impact for button presses
  button() {
    if (!this.isAvailable) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  // Medium impact for card interactions
  card() {
    if (!this.isAvailable) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  // Heavy impact for important actions
  action() {
    if (!this.isAvailable) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }

  // Success feedback
  success() {
    if (!this.isAvailable) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  // Error feedback
  error() {
    if (!this.isAvailable) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  // Warning feedback
  warning() {
    if (!this.isAvailable) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }

  // Selection feedback (for picker/selection changes)
  select() {
    if (!this.isAvailable) return;
    Haptics.selectionAsync();
  }

  // Navigation feedback
  navigate() {
    if (!this.isAvailable) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export const haptics = new HapticManager();

// Utility hooks for common haptic patterns
export const useHapticButton = (onPress?: () => void) => {
  return () => {
    haptics.button();
    onPress?.();
  };
};

export const useHapticCard = (onPress?: () => void) => {
  return () => {
    haptics.card();
    onPress?.();
  };
};

export const useHapticAction = (onPress?: () => void, type: 'success' | 'error' | 'warning' = 'success') => {
  return () => {
    if (type === 'success') haptics.success();
    else if (type === 'error') haptics.error();
    else haptics.warning();

    onPress?.();
  };
};