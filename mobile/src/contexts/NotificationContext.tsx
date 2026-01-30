import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  notificationService,
  NotificationStats,
  NotificationPreferences,
} from '../services/notificationService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  // State
  isInitialized: boolean;
  isRegistered: boolean;
  pushToken: string | null;
  stats: NotificationStats | null;
  preferences: NotificationPreferences | null;
  hasPermissions: boolean;

  // Actions
  initializeNotifications: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  registerDevice: () => Promise<void>;
  unregisterDevice: () => Promise<void>;
  refreshStats: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  sendTestNotification: () => Promise<void>;

  // Loading states
  loading: {
    initializing: boolean;
    registering: boolean;
    refreshing: boolean;
    updating: boolean;
  };
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PERMISSIONS_GRANTED: '@notifications_permissions_granted',
  LAST_REGISTRATION: '@notifications_last_registration',
} as const;

interface Props {
  children: ReactNode;
}

export function NotificationProvider({ children }: Props) {
  const { token, user } = useAuth();

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);

  // Loading states
  const [loading, setLoading] = useState({
    initializing: false,
    registering: false,
    refreshing: false,
    updating: false,
  });

  // Initialize notifications when user logs in
  useEffect(() => {
    if (token && user && !isInitialized) {
      initializeNotifications();
    }
  }, [token, user, isInitialized]);

  // Cleanup when user logs out
  useEffect(() => {
    if (!token && isInitialized) {
      cleanup();
    }
  }, [token, isInitialized]);

  const initializeNotifications = async (): Promise<void> => {
    if (loading.initializing || isInitialized) return;

    try {
      setLoading(prev => ({ ...prev, initializing: true }));

      // Check if permissions were previously granted
      const permissionsGranted = await AsyncStorage.getItem(STORAGE_KEYS.PERMISSIONS_GRANTED);
      setHasPermissions(permissionsGranted === 'true');

      // Initialize notification service
      await notificationService.initialize();

      // Update state
      setIsRegistered(notificationService.getIsRegistered());
      setPushToken(notificationService.getPushToken());
      setIsInitialized(true);

      // Load user preferences and stats
      await Promise.all([
        loadPreferences(),
        refreshStats(),
      ]);

      console.log('Notifications initialized successfully');
    } catch (error) {
      console.error('Error initializing notifications:', error);
    } finally {
      setLoading(prev => ({ ...prev, initializing: false }));
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const granted = await notificationService.requestPermissions();
      setHasPermissions(granted);

      // Store permission result
      await AsyncStorage.setItem(
        STORAGE_KEYS.PERMISSIONS_GRANTED,
        granted.toString()
      );

      if (granted && !isRegistered) {
        await registerDevice();
      }

      return granted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const registerDevice = async (): Promise<void> => {
    if (loading.registering || isRegistered) return;

    try {
      setLoading(prev => ({ ...prev, registering: true }));

      const token = await notificationService.getPushToken();
      if (token) {
        await notificationService.registerDevice(token);

        setIsRegistered(true);
        setPushToken(token);

        // Store registration timestamp
        await AsyncStorage.setItem(
          STORAGE_KEYS.LAST_REGISTRATION,
          new Date().toISOString()
        );

        // Refresh stats after registration
        await refreshStats();
      }
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, registering: false }));
    }
  };

  const unregisterDevice = async (): Promise<void> => {
    try {
      await notificationService.unregisterDevice();

      setIsRegistered(false);
      setPushToken(null);

      // Clear stored data
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.PERMISSIONS_GRANTED),
        AsyncStorage.removeItem(STORAGE_KEYS.LAST_REGISTRATION),
      ]);

      await refreshStats();
    } catch (error) {
      console.error('Error unregistering device:', error);
      throw error;
    }
  };

  const loadPreferences = async (): Promise<void> => {
    try {
      const data = await notificationService.getNotificationPreferences();
      setPreferences(data.preferences);

      // Update registration status based on backend data
      if (data.hasDeviceRegistered !== isRegistered) {
        setIsRegistered(data.hasDeviceRegistered);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const refreshStats = async (): Promise<void> => {
    if (loading.refreshing) return;

    try {
      setLoading(prev => ({ ...prev, refreshing: true }));
      const newStats = await notificationService.getNotificationStats();
      setStats(newStats);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    } finally {
      setLoading(prev => ({ ...prev, refreshing: false }));
    }
  };

  const updatePreferences = async (
    newPreferences: Partial<NotificationPreferences>
  ): Promise<void> => {
    if (loading.updating) return;

    try {
      setLoading(prev => ({ ...prev, updating: true }));

      await notificationService.updateNotificationPreferences(newPreferences);

      // Update local state
      setPreferences(prev =>
        prev ? { ...prev, ...newPreferences } : null
      );
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };

  const sendTestNotification = async (): Promise<void> => {
    try {
      await notificationService.sendTestNotification();
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  };

  const cleanup = (): void => {
    try {
      notificationService.cleanup();

      // Reset state
      setIsInitialized(false);
      setIsRegistered(false);
      setPushToken(null);
      setStats(null);
      setPreferences(null);
      setHasPermissions(false);
      setLoading({
        initializing: false,
        registering: false,
        refreshing: false,
        updating: false,
      });
    } catch (error) {
      console.error('Error during notification cleanup:', error);
    }
  };

  const value: NotificationContextType = {
    // State
    isInitialized,
    isRegistered,
    pushToken,
    stats,
    preferences,
    hasPermissions,

    // Actions
    initializeNotifications,
    requestPermissions,
    registerDevice,
    unregisterDevice,
    refreshStats,
    updatePreferences,
    sendTestNotification,

    // Loading states
    loading,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}