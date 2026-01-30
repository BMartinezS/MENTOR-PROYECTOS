import { DataTypes } from 'sequelize';

import sequelize from '../config/database.js';

const UserStats = sequelize.define(
  'UserStats',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    currentStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    longestStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    lastCheckinDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    totalXP: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    totalTasksCompleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    totalProjectsCompleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    totalCheckinsCompleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
        unique: true,
      },
      {
        fields: ['total_xp'],
      },
    ],
  }
);

export default UserStats;
