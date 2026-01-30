import { DataTypes } from 'sequelize';

import sequelize from '../config/database.js';

const UserAchievement = sequelize.define(
  'UserAchievement',
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
    achievementId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unlockedAt: {
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
        fields: ['user_id', 'achievement_id'],
      },
      {
        fields: ['user_id'],
      },
    ],
  }
);

export default UserAchievement;
