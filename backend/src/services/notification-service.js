import { Expo } from 'expo-server-sdk';
import cron from 'node-cron';
import { Op } from 'sequelize';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

class NotificationService {
  constructor() {
    this.expo = new Expo();
    this.setupScheduledJobs();
  }

  setupScheduledJobs() {
    // Daily reminder at 9:00 AM
    cron.schedule('0 9 * * *', () => {
      this.sendDailyReminders();
    });

    // Evening progress check at 6:00 PM
    cron.schedule('0 18 * * *', () => {
      this.sendProgressReminders();
    });

    // Weekly project review on Sundays at 10:00 AM
    cron.schedule('0 10 * * 0', () => {
      this.sendWeeklyReview();
    });
  }

  async registerDevice(userId, expoPushToken) {
    try {
      // Validate the token format
      if (!Expo.isExpoPushToken(expoPushToken)) {
        throw new Error('Invalid Expo push token format');
      }

      // Update user's push token in database
      await User.update(
        { expoPushToken },
        { where: { id: userId } }
      );

      return { success: true, message: 'Device registered successfully' };
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  async sendNotification(userId, title, body, data = {}) {
    try {
      const user = await User.findByPk(userId);
      if (!user?.expoPushToken) {
        console.log(`No push token found for user ${userId}`);
        return { success: false, error: 'No push token' };
      }

      const message = {
        to: user.expoPushToken,
        sound: 'default',
        title,
        body,
        data,
        priority: 'high',
        channelId: 'task-reminders',
      };

      const tickets = await this.expo.sendPushNotificationsAsync([message]);

      // Handle push tickets for delivery confirmation
      this.handlePushTickets(tickets);

      return { success: true, tickets };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  async sendDailyReminders() {
    try {
      console.log('Sending daily reminders...');

      // Get users with active projects and push tokens
      const users = await User.findAll({
        where: {
          expoPushToken: { [Op.ne]: null }
        },
        include: [{
          model: Project,
          where: { status: 'active' },
          required: true,
          include: [{
            model: Task,
            where: {
              status: { [Op.in]: ['pending', 'in_progress'] },
              dueDate: {
                [Op.lte]: new Date(Date.now() + 24 * 60 * 60 * 1000) // Due within 24 hours
              }
            },
            required: false
          }]
        }]
      });

      for (const user of users) {
        await this.sendPersonalizedReminder(user);
      }
    } catch (error) {
      console.error('Error in daily reminders:', error);
    }
  }

  async sendPersonalizedReminder(user) {
    const activeProjects = user.Projects;
    const urgentTasks = activeProjects.flatMap(p => p.Tasks || []);

    if (urgentTasks.length === 0) {
      // Send motivational message for users without urgent tasks
      await this.sendNotification(
        user.id,
        '¡Buen trabajo! 🎉',
        'No tienes tareas urgentes hoy. ¿Qué tal planificar el siguiente paso?',
        { type: 'motivation', screen: 'dashboard' }
      );
      return;
    }

    const urgentCount = urgentTasks.length;
    const projectNames = [...new Set(activeProjects.map(p => p.title))].slice(0, 2);

    let title, body;

    if (urgentCount === 1) {
      title = '⏰ Tarea pendiente';
      body = `Tienes 1 tarea por completar en "${projectNames[0]}"`;
    } else if (urgentCount <= 3) {
      title = `⏰ ${urgentCount} tareas pendientes`;
      body = projectNames.length > 1
        ? `En "${projectNames[0]}" y "${projectNames[1]}"`
        : `En "${projectNames[0]}"`;
    } else {
      title = '🔥 Muchas tareas pendientes';
      body = `${urgentCount} tareas esperan tu atención. ¡Vamos por ellas!`;
    }

    await this.sendNotification(
      user.id,
      title,
      body,
      {
        type: 'task_reminder',
        taskCount: urgentCount,
        projectIds: activeProjects.map(p => p.id),
        screen: 'dashboard'
      }
    );
  }

  async sendProgressReminders() {
    try {
      console.log('Sending progress reminders...');

      // Find projects with low activity (no task updates in last 3 days)
      const staleProjects = await Project.findAll({
        where: {
          status: 'active',
          updatedAt: {
            [Op.lt]: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          }
        },
        include: [{
          model: User,
          where: { expoPushToken: { [Op.ne]: null } }
        }]
      });

      for (const project of staleProjects) {
        const progressPercentage = project.progress || 0;

        let title, body;
        if (progressPercentage < 25) {
          title = '🚀 ¡Comienza tu proyecto!';
          body = `"${project.title}" está esperando tu primer paso`;
        } else if (progressPercentage < 75) {
          title = '💪 ¡Sigue adelante!';
          body = `"${project.title}" va en ${progressPercentage}%. ¡Ya casi!`;
        } else {
          title = '🎯 ¡Casi terminado!';
          body = `"${project.title}" está al ${progressPercentage}%. ¡El final está cerca!`;
        }

        await this.sendNotification(
          project.User.id,
          title,
          body,
          {
            type: 'progress_reminder',
            projectId: project.id,
            progress: progressPercentage,
            screen: 'project',
            projectId: project.id
          }
        );
      }
    } catch (error) {
      console.error('Error in progress reminders:', error);
    }
  }

  async sendWeeklyReview() {
    try {
      console.log('Sending weekly review notifications...');

      const users = await User.findAll({
        where: { expoPushToken: { [Op.ne]: null } },
        include: [{
          model: Project,
          include: [{
            model: Task,
            where: {
              completedAt: {
                [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            },
            required: false
          }]
        }]
      });

      for (const user of users) {
        const completedTasks = user.Projects.flatMap(p => p.Tasks || []);
        const totalProjects = user.Projects.length;
        const activeProjects = user.Projects.filter(p => p.status === 'active').length;

        await this.sendNotification(
          user.id,
          '📊 Resumen semanal',
          `Completaste ${completedTasks.length} tareas. ${activeProjects} proyectos activos.`,
          {
            type: 'weekly_review',
            completedTasks: completedTasks.length,
            activeProjects,
            totalProjects,
            screen: 'dashboard'
          }
        );
      }
    } catch (error) {
      console.error('Error in weekly review:', error);
    }
  }

  async sendTaskDeadlineAlert(taskId) {
    try {
      const task = await Task.findByPk(taskId, {
        include: [{
          model: Project,
          include: [{ model: User }]
        }]
      });

      if (!task?.Project?.User?.expoPushToken) {
        return { success: false, error: 'User or token not found' };
      }

      const hoursUntilDeadline = Math.ceil(
        (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60)
      );

      let title, body;
      if (hoursUntilDeadline <= 2) {
        title = '🚨 ¡Deadline inminente!';
        body = `"${task.title}" vence en ${hoursUntilDeadline} horas`;
      } else if (hoursUntilDeadline <= 24) {
        title = '⏰ Deadline próximo';
        body = `"${task.title}" vence mañana`;
      } else {
        title = '📅 Recordatorio';
        body = `"${task.title}" vence pronto`;
      }

      return await this.sendNotification(
        task.Project.User.id,
        title,
        body,
        {
          type: 'deadline_alert',
          taskId: task.id,
          projectId: task.projectId,
          hoursRemaining: hoursUntilDeadline,
          screen: 'project',
          projectId: task.projectId
        }
      );
    } catch (error) {
      console.error('Error sending deadline alert:', error);
      throw error;
    }
  }

  async sendCustomNotification(userId, type, customData) {
    const templates = {
      project_completed: {
        title: '🎉 ¡Proyecto completado!',
        body: `¡Felicitaciones por terminar "${customData.projectTitle}"!`,
        data: { type: 'project_completed', screen: 'dashboard' }
      },
      milestone_achieved: {
        title: '🏆 ¡Hito alcanzado!',
        body: `Has completado "${customData.milestoneName}"`,
        data: { type: 'milestone_achieved', screen: 'project', projectId: customData.projectId }
      },
      team_invitation: {
        title: '👥 Invitación a proyecto',
        body: `Te han invitado a colaborar en "${customData.projectTitle}"`,
        data: { type: 'team_invitation', screen: 'project', projectId: customData.projectId }
      }
    };

    const template = templates[type];
    if (!template) {
      throw new Error(`Unknown notification type: ${type}`);
    }

    return await this.sendNotification(
      userId,
      template.title,
      template.body,
      { ...template.data, ...customData }
    );
  }

  async handlePushTickets(tickets) {
    // Handle receipt verification for delivery confirmation
    const receiptIds = tickets
      .filter(ticket => ticket.status === 'ok')
      .map(ticket => ticket.id);

    if (receiptIds.length > 0) {
      setTimeout(async () => {
        try {
          const receipts = await this.expo.getPushNotificationReceiptsAsync(receiptIds);

          for (const receiptId in receipts) {
            const receipt = receipts[receiptId];
            if (receipt.status === 'error') {
              console.error('Notification delivery error:', receipt.message);
              if (receipt.details?.error === 'DeviceNotRegistered') {
                // Handle device token cleanup
                await this.cleanupInvalidTokens([receipt.details.expoPushToken]);
              }
            }
          }
        } catch (error) {
          console.error('Error checking receipts:', error);
        }
      }, 15000); // Wait 15 seconds before checking receipts
    }
  }

  async cleanupInvalidTokens(invalidTokens) {
    try {
      await User.update(
        { expoPushToken: null },
        {
          where: {
            expoPushToken: { [Op.in]: invalidTokens }
          }
        }
      );
      console.log(`Cleaned up ${invalidTokens.length} invalid tokens`);
    } catch (error) {
      console.error('Error cleaning up tokens:', error);
    }
  }

  async getNotificationStats(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [{
          model: Project,
          where: { status: 'active' },
          required: false,
          include: [{
            model: Task,
            where: {
              status: { [Op.in]: ['pending', 'in_progress'] }
            },
            required: false
          }]
        }]
      });

      if (!user) {
        throw new Error('User not found');
      }

      const activeProjects = user.Projects.length;
      const pendingTasks = user.Projects.reduce((count, project) => count + (project.Tasks?.length || 0), 0);
      const urgentTasks = user.Projects.reduce((count, project) => {
        const urgent = (project.Tasks || []).filter(task =>
          task.dueDate && new Date(task.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
        );
        return count + urgent.length;
      }, 0);

      return {
        hasNotificationsEnabled: !!user.expoPushToken,
        activeProjects,
        pendingTasks,
        urgentTasks,
        nextReminderTime: '09:00' // Fixed time for daily reminders
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }
}

export default new NotificationService();