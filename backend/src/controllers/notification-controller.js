import notificationService from '../services/notification-service.js';
import User from '../models/User.js';
import Joi from 'joi';

class NotificationController {
  // Register device for push notifications
  async registerDevice(req, res) {
    try {
      const schema = Joi.object({
        expoPushToken: Joi.string().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const { expoPushToken } = value;
      const userId = req.user.id;

      const result = await notificationService.registerDevice(userId, expoPushToken);

      res.status(200).json({
        success: true,
        message: 'Device registered successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in registerDevice:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Unregister device (remove push token)
  async unregisterDevice(req, res) {
    try {
      const userId = req.user.id;

      await User.update(
        { expoPushToken: null },
        { where: { id: userId } }
      );

      res.status(200).json({
        success: true,
        message: 'Device unregistered successfully'
      });
    } catch (error) {
      console.error('Error in unregisterDevice:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Send custom notification (admin or system use)
  async sendNotification(req, res) {
    try {
      const schema = Joi.object({
        title: Joi.string().required().max(100),
        body: Joi.string().required().max(200),
        data: Joi.object().default({}),
        userId: Joi.string().uuid().optional() // If not provided, send to current user
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const { title, body, data, userId } = value;
      const targetUserId = userId || req.user.id;

      const result = await notificationService.sendNotification(
        targetUserId,
        title,
        body,
        data
      );

      res.status(200).json({
        success: true,
        message: 'Notification sent successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in sendNotification:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Send task deadline alert manually
  async sendTaskDeadlineAlert(req, res) {
    try {
      const schema = Joi.object({
        taskId: Joi.string().uuid().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const { taskId } = value;

      const result = await notificationService.sendTaskDeadlineAlert(taskId);

      res.status(200).json({
        success: true,
        message: 'Deadline alert sent successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in sendTaskDeadlineAlert:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Send custom notification by type
  async sendCustomNotification(req, res) {
    try {
      const schema = Joi.object({
        type: Joi.string().valid(
          'project_completed',
          'milestone_achieved',
          'team_invitation'
        ).required(),
        customData: Joi.object().required(),
        userId: Joi.string().uuid().optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const { type, customData, userId } = value;
      const targetUserId = userId || req.user.id;

      const result = await notificationService.sendCustomNotification(
        targetUserId,
        type,
        customData
      );

      res.status(200).json({
        success: true,
        message: 'Custom notification sent successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in sendCustomNotification:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get notification statistics for user
  async getNotificationStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = await notificationService.getNotificationStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getNotificationStats:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(req, res) {
    try {
      const schema = Joi.object({
        dailyReminders: Joi.boolean().default(true),
        progressReminders: Joi.boolean().default(true),
        weeklyReview: Joi.boolean().default(true),
        deadlineAlerts: Joi.boolean().default(true),
        teamNotifications: Joi.boolean().default(true),
        reminderTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default('09:00')
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const userId = req.user.id;
      const preferences = value;

      // Update user preferences in database
      await User.update(
        { notificationPreferences: preferences },
        { where: { id: userId } }
      );

      res.status(200).json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: preferences
      });
    } catch (error) {
      console.error('Error in updateNotificationPreferences:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get notification preferences
  async getNotificationPreferences(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId, {
        attributes: ['notificationPreferences', 'expoPushToken']
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const defaultPreferences = {
        dailyReminders: true,
        progressReminders: true,
        weeklyReview: true,
        deadlineAlerts: true,
        teamNotifications: true,
        reminderTime: '09:00'
      };

      const preferences = user.notificationPreferences || defaultPreferences;

      res.status(200).json({
        success: true,
        data: {
          preferences,
          hasDeviceRegistered: !!user.expoPushToken
        }
      });
    } catch (error) {
      console.error('Error in getNotificationPreferences:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Test notification endpoint (development only)
  async sendTestNotification(req, res) {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          error: 'Test notifications not allowed in production'
        });
      }

      const userId = req.user.id;

      const result = await notificationService.sendNotification(
        userId,
        '🧪 Test Notification',
        'This is a test notification from your app!',
        {
          type: 'test',
          timestamp: new Date().toISOString(),
          screen: 'dashboard'
        }
      );

      res.status(200).json({
        success: true,
        message: 'Test notification sent successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in sendTestNotification:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new NotificationController();