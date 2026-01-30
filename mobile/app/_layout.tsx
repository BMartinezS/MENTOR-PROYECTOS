import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';

import { PAPER_THEME } from '../constants/theme';
import { AuthProvider } from '../src/contexts/AuthContext';
import { NotificationProvider } from '../src/contexts/NotificationContext';
import { PurchaseProvider } from '../src/contexts/PurchaseContext';
import { ToastProvider } from '../src/contexts/ToastContext';

export default function RootLayout() {
  return (
    <PaperProvider theme={PAPER_THEME}>
      <AuthProvider>
        <PurchaseProvider>
          <NotificationProvider>
            <ToastProvider>
              <StatusBar style="auto" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="project" />
                <Stack.Screen name="task" />
                <Stack.Screen name="weekly-review" />
                <Stack.Screen name="paywall" />
                <Stack.Screen name="onboarding" />
              </Stack>
            </ToastProvider>
          </NotificationProvider>
        </PurchaseProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

