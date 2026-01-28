import { DataTypes } from 'sequelize';

import sequelize from '../config/database.js';

const Project = sequelize.define(
  'Project',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    area: {
      type: DataTypes.ENUM('marketing', 'product', 'operations', 'general'),
      allowNull: false,
      defaultValue: 'general',
    },
    planFormat: {
      type: DataTypes.ENUM('lean', 'standard', 'detailed'),
      allowNull: false,
      defaultValue: 'standard',
    },
    area: {
      type: DataTypes.ENUM('marketing', 'product', 'operations', 'general'),
      allowNull: false,
      defaultValue: 'general',
    },
    planFormat: {
      type: DataTypes.ENUM('lean', 'standard', 'detailed'),
      allowNull: false,
      defaultValue: 'standard',
    },
    status: {
      type: DataTypes.ENUM('active', 'paused', 'completed', 'cancelled'),
      defaultValue: 'active',
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0, max: 100 },
    },
    targetDate: {
      type: DataTypes.DATEONLY,
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

export default Project;

