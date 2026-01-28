import express from 'express';
import notificationController from '../controllers/notification-controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/notifications/register
 * @desc    Register device for push notifications
 * @access  Private
 * @body    { expoPushToken: string }
 */
router.post('/register', notificationController.registerDevice);

/**
 * @route   POST /api/notifications/unregister
 * @desc    Unregister device (remove push token)
 * @access  Private
 */
router.post('/unregister', notificationController.unregisterDevice);

/**
 * @route   POST /api/notifications/send
 * @desc    Send custom notification
 * @access  Private
 * @body    { title: string, body: string, data?: object, userId?: string }
 */
router.post('/send', notificationController.sendNotification);

/**
 * @route   POST /api/notifications/deadline-alert
 * @desc    Send task deadline alert manually
 * @access  Private
 * @body    { taskId: string }
 */
router.post('/deadline-alert', notificationController.sendTaskDeadlineAlert);

/**
 * @route   POST /api/notifications/custom
 * @desc    Send custom notification by type
 * @access  Private
 * @body    { type: string, customData: object, userId?: string }
 */
router.post('/custom', notificationController.sendCustomNotification);

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics for current user
 * @access  Private
 */
router.get('/stats', notificationController.getNotificationStats);

/**
 * @route   PUT /api/notifications/preferences
 * @desc    Update notification preferences
 * @access  Private
 * @body    { dailyReminders?: boolean, progressReminders?: boolean, ... }
 */
router.put('/preferences', notificationController.updateNotificationPreferences);

/**
 * @route   GET /api/notifications/preferences
 * @desc    Get notification preferences
 * @access  Private
 */
router.get('/preferences', notificationController.getNotificationPreferences);

/**
 * @route   POST /api/notifications/test
 * @desc    Send test notification (development only)
 * @access  Private
 */
router.post('/test', notificationController.sendTestNotification);

export default router;