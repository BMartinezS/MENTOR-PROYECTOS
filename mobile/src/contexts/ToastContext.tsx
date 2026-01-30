import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Snackbar, Text } from 'react-native-paper';

import { COLORS, RADIUS, SPACING } from '../../constants/theme';

type ToastType = 'success' | 'error' | 'info';

type ToastOptions = {
  duration?: number;
};

type ToastContextValue = {
  showSuccess: (message: string, options?: ToastOptions) => void;
  showError: (message: string, options?: ToastOptions) => void;
  showInfo: (message: string, options?: ToastOptions) => void;
};

const DEFAULT_DURATION = 3000;

const ToastContext = createContext<ToastContextValue>({} as ToastContextValue);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('info');
  const [duration, setDuration] = useState(DEFAULT_DURATION);

  const showToast = useCallback((type: ToastType, msg: string, options?: ToastOptions) => {
    setMessage(msg);
    setToastType(type);
    setDuration(options?.duration ?? DEFAULT_DURATION);
    setVisible(true);
  }, []);

  const showSuccess = useCallback(
    (msg: string, options?: ToastOptions) => {
      showToast('success', msg, options);
    },
    [showToast]
  );

  const showError = useCallback(
    (msg: string, options?: ToastOptions) => {
      showToast('error', msg, options);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (msg: string, options?: ToastOptions) => {
      showToast('info', msg, options);
    },
    [showToast]
  );

  const onDismiss = useCallback(() => {
    setVisible(false);
  }, []);

  const getBackgroundColor = (): string => {
    switch (toastType) {
      case 'success':
        return COLORS.success;
      case 'error':
        return COLORS.danger;
      case 'info':
      default:
        return COLORS.primary;
    }
  };

  const value = useMemo<ToastContextValue>(
    () => ({
      showSuccess,
      showError,
      showInfo,
    }),
    [showSuccess, showError, showInfo]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={onDismiss}
        duration={duration}
        onIconPress={onDismiss}
        style={[styles.snackbar, { backgroundColor: getBackgroundColor() }]}
        wrapperStyle={styles.wrapper}
      >
        <View style={styles.content}>
          <Text style={styles.text}>{message}</Text>
        </View>
      </Snackbar>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  snackbar: {
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING(2),
    marginBottom: SPACING(2),
  },
  text: {
    color: '#FFFFFF',
    flex: 1,
  },
  wrapper: {
    zIndex: 9999,
  },
});
