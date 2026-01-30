import { DataTypes } from 'sequelize';

import sequelize from '../config/database.js';

const Achievement = sequelize.define(
  'Achievement',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    xpReward: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['streak', 'project', 'task', 'checkin']],
      },
    },
    requirement: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

export default Achievement;
