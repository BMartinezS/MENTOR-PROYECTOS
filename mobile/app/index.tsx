import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Redirect } from 'expo-router';

import Screen from './components/Screen';
import { useAuth } from '../src/contexts/AuthContext';

const ONBOARDING_KEY = 'hasSeenOnboarding';

export default function Index() {
  const { token, loading: authLoading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasSeenOnboarding(value === 'true');
      } catch (error) {
        // If there's an error reading, assume they've seen it to avoid blocking
        setHasSeenOnboarding(true);
      }
    };
    void checkOnboarding();
  }, []);

  const loading = authLoading || hasSeenOnboarding === null;

  if (loading) {
    return (
      <Screen center>
        <ActivityIndicator />
      </Screen>
    );
  }

  // Show onboarding first if user hasn't seen it
  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)/dashboard" />;
}

