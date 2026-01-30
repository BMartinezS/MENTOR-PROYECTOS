import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';

import sequelize from '../config/database.js';

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'America/Santiago',
    },
    tier: {
      type: DataTypes.ENUM('free', 'pro'),
      defaultValue: 'free',
    },
    subscriptionExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    subscriptionProductId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    expoPushToken: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isExpoPushToken(value) {
          if (value && !value.match(/^ExponentPushToken\[.+\]$/)) {
            throw new Error('Invalid Expo push token format');
          }
        },
      },
    },
    notificationPreferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        dailyReminders: true,
        progressReminders: true,
        weeklyReview: true,
        deadlineAlerts: true,
        teamNotifications: true,
        reminderTime: '09:00',
      },
    },
  },
  {
    timestamps: true,
    underscored: true,
    defaultScope: {
      attributes: { exclude: ['passwordHash'] },
    },
    scopes: {
      withPassword: {
        attributes: {},
      },
    },
  }
);

User.prototype.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export default User;

