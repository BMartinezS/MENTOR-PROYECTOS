import { DataTypes } from 'sequelize';

import sequelize from '../config/database.js';

const Task = sequelize.define(
  'Task',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    phaseId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    milestoneId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    responsible: {
      type: DataTypes.STRING(100),
    },
    notes: {
      type: DataTypes.TEXT,
    },
    deliverables: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    dependencies: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    metrics: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'blocked'),
      defaultValue: 'pending',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },
    estimatedHours: {
      type: DataTypes.DECIMAL(5, 2),
    },
    dueDate: {
      type: DataTypes.DATEONLY,
    },
    completedAt: {
      type: DataTypes.DATE,
    },
    blockedReason: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

export default Task;

