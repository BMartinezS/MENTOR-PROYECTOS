import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { router } from 'expo-router';

import { api } from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: string;
  screen?: string;
  projectId?: string;
  taskId?: string;
  [key: string]: any;
}

export interface NotificationStats {
  hasNotificationsEnabled: boolean;
  activeProjects: number;
  pendingTasks: number;
  urgentTasks: number;
  nextReminderTime: string;
}

export interface NotificationPreferences {
  dailyReminders: boolean;
  progressReminders: boolean;
  weeklyReview: boolean;
  deadlineAlerts: boolean;
  teamNotifications: boolean;
  reminderTime: string;
}

class NotificationService {
  private pushToken: string | null = null;
  private isRegistered = false;
  private notificationListener: any = null;
  private responseListener: any = null;

  async initialize(): Promise<void> {
    try {
      // Check if running on physical device
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return;
      }

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Notification permissions not granted');
        return;
      }

      // Get push token
      const token = await this.getPushToken();
      if (token) {
        this.pushToken = token;
        await this.registerDevice(token);
      }

      // Set up listeners
      this.setupListeners();

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await this.setupAndroidChannel();
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions denied');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async getPushToken(): Promise<string | null> {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

      if (!projectId) {
        console.error('No project ID found for push notifications');
        console.info('Configure EAS project ID by running: npx eas init');
        return null;
      }

      // Check if it's still the placeholder UUID
      if (projectId === '12345678-1234-1234-1234-123456789abc') {
        console.warn('Using placeholder project ID. Configure real EAS project ID with: npx eas init');
        console.info('Push notifications may not work until real project ID is configured');
      }

      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      console.info('If error is about project ID, run: npx eas init to configure properly');
      return null;
    }
  }

  async registerDevice(token: string): Promise<void> {
    try {
      await api.notifications.register({
        expoPushToken: token,
      });

      this.isRegistered = true;
      console.log('Device registered for push notifications');
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  async unregisterDevice(): Promise<void> {
    try {
      await api.notifications.unregister();
      this.isRegistered = false;
      this.pushToken = null;
      console.log('Device unregistered from push notifications');
    } catch (error) {
      console.error('Error unregistering device:', error);
      throw error;
    }
  }

  setupListeners(): void {
    // Listener for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        this.handleNotificationReceived(notification);
      }
    );

    // Listener for user tapping on notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  private handleNotificationReceived(notification: Notifications.Notification): void {
    const data = notification.request.content.data as NotificationData;

    // You can handle custom logic here when notifications are received
    // For example, update local state, show custom UI, etc.
    console.log('Processing notification:', data.type);
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const data = response.notification.request.content.data as NotificationData;

    // Navigate to appropriate screen based on notification data
    this.navigateFromNotification(data);
  }

  private navigateFromNotification(data: NotificationData): void {
    try {
      switch (data.type) {
        case 'task_reminder':
        case 'deadline_alert':
          if (data.projectId) {
            router.push(`/project/${data.projectId}`);
          } else {
            router.push('/dashboard');
          }
          break;

        case 'progress_reminder':
        case 'project_completed':
        case 'milestone_achieved':
          if (data.projectId) {
            router.push(`/project/${data.projectId}`);
          } else {
            router.push('/dashboard');
          }
          break;

        case 'team_invitation':
          if (data.projectId) {
            router.push(`/project/${data.projectId}`);
          }
          break;

        case 'weekly_review':
        case 'motivation':
        default:
          router.push('/dashboard');
          break;
      }
    } catch (error) {
      console.error('Error navigating from notification:', error);
      // Fallback to dashboard
      router.push('/dashboard');
    }
  }

  async setupAndroidChannel(): Promise<void> {
    try {
      await Notifications.setNotificationChannelAsync('task-reminders', {
        name: 'Task Reminders',
        description: 'Notifications for task deadlines and progress reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00F5FF',
        showBadge: true,
      });

      await Notifications.setNotificationChannelAsync('general', {
        name: 'General Notifications',
        description: 'General app notifications and updates',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    } catch (error) {
      console.error('Error setting up Android notification channels:', error);
    }
  }

  async sendTestNotification(): Promise<void> {
    try {
      await api.notifications.sendTest();
      console.log('Test notification sent');
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }

  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const response = await api.notifications.getStats();
      return response;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }

  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      await api.notifications.updatePreferences(preferences);
      console.log('Notification preferences updated');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  async getNotificationPreferences(): Promise<{
    preferences: NotificationPreferences;
    hasDeviceRegistered: boolean;
  }> {
    try {
      const response = await api.notifications.getPreferences();
      return response;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      throw error;
    }
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data: NotificationData,
    triggerDate: Date
  ): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: {
          date: triggerDate,
        },
      });

      console.log('Local notification scheduled:', identifier);
      return identifier;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      throw error;
    }
  }

  async cancelLocalNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log('Local notification cancelled:', identifier);
    } catch (error) {
      console.error('Error cancelling local notification:', error);
      throw error;
    }
  }

  async cancelAllLocalNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All local notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all local notifications:', error);
      throw error;
    }
  }

  getPushToken(): string | null {
    return this.pushToken;
  }

  getIsRegistered(): boolean {
    return this.isRegistered;
  }

  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }
  }
}

export const notificationService = new NotificationService();