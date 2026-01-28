import { ActivityIndicator } from 'react-native';

import { Redirect } from 'expo-router';

import Screen from './components/Screen';
import { useAuth } from './contexts/AuthContext';

export default function Index() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <Screen center>
        <ActivityIndicator />
      </Screen>
    );
  }

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)/dashboard" />;
}

