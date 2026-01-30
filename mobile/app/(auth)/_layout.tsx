import { Stack } from 'expo-router';

import { Redirect } from 'expo-router';

import { useAuth } from '../../src/contexts/AuthContext';

export default function AuthLayout() {
  const { token } = useAuth();

  if (token) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
