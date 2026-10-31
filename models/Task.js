import {DataTypes} from 'sequelize';
import sequelize from '../connection/database.js';

const Task = sequelize.define(
    'Task',
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
      },

      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        allowNull: false,
      },

      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      googleEventId: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      googleSyncStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'not_synced',
      },

      googleSyncError: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'Task',
      timestamps: true,
    },
);

export default Task;
