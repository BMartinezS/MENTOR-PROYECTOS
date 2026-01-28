import { DataTypes } from 'sequelize';

import sequelize from '../config/database.js';

const PlanIteration = sequelize.define(
  'PlanIteration',
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
    iterationNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    feedback: {
      type: DataTypes.TEXT,
    },
    focusArea: {
      type: DataTypes.STRING(100),
    },
    planSnapshot: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    updatedAt: false,
  }
);

export default PlanIteration;
