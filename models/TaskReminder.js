import {DataTypes} from 'sequelize';
import sequelize from '../connection/database.js';

const TaskReminder = sequelize.define(
    'TaskReminder',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      minutesBefore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },

      remindAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM(
            'pending',
            'processing',
            'sent',
            'failed',
            'cancelled',
        ),
        allowNull: false,
        defaultValue: 'pending',
      },

      attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      nextAttemptAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      lockedUntil: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'TaskReminders',
      timestamps: true,
    },
);

export default TaskReminder;
