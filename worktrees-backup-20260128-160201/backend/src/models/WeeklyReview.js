import { DataTypes } from 'sequelize';

import sequelize from '../config/database.js';

const WeeklyReview = sequelize.define(
  'WeeklyReview',
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    weekStartDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    weekEndDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    questions: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    suggestions: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    userAnswers: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

export default WeeklyReview;
