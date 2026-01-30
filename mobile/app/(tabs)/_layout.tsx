import { Redirect, Tabs } from 'expo-router';
import { LayoutDashboard, CheckCircle2, User, Bell } from 'lucide-react-native';

import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS, RADIUS } from '../../constants/theme';

/**
 * Minimalist Tab Layout
 * - Clean, subtle tab bar
 * - Soft shadows
 * - Rounded active indicator
 */
export default function TabsLayout() {
  const { token, loading } = useAuth();

  if (!loading && !token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.borderLight,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
          elevation: 0,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="checkins"
        options={{
          title: 'Check-ins',
          tabBarIcon: ({ color, size }) => (
            <CheckCircle2 size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color, size }) => (
            <Bell size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <User size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
