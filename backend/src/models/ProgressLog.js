import { DataTypes } from 'sequelize';

import sequelize from '../config/database.js';

const ProgressLog = sequelize.define(
  'ProgressLog',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    evidenceType: {
      type: DataTypes.ENUM('text', 'link', 'file', 'image'),
    },
    evidenceContent: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: true,
    underscored: true,
    updatedAt: false,
  }
);

export default ProgressLog;

