import { DataTypes } from 'sequelize';

import sequelize from '../config/database.js';

const Checkin = sequelize.define(
  'Checkin',
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
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('daily', 'weekly', 'blocking'),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    respondedAt: {
      type: DataTypes.DATE,
    },
    response: {
      type: DataTypes.JSONB,
    },
  },
  {
    timestamps: true,
    underscored: true,
    updatedAt: false,
  }
);

export default Checkin;

