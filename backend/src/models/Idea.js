import { DataTypes } from 'sequelize';

import sequelize from '../config/database.js';

const Idea = sequelize.define(
  'Idea',
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
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM('active', 'archived', 'promoted'),
      defaultValue: 'active',
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    promotedToProjectId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['created_at'] },
    ],
  }
);

export default Idea;
