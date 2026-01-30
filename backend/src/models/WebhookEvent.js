import { DataTypes } from 'sequelize';

import sequelize from '../config/database.js';

const WebhookEvent = sequelize.define(
  'WebhookEvent',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'revenuecat',
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['event_id'],
      },
      {
        fields: ['source', 'event_type'],
      },
      {
        fields: ['created_at'],
      },
    ],
  }
);

export default WebhookEvent;
