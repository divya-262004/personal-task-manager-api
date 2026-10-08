import {DataTypes} from 'sequelize';
import sequelize from '../connection/database.js';

const TaskCollaborator = sequelize.define(
    'TaskCollaborator',
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

      role: {
        type: DataTypes.ENUM('editor', 'viewer'),
        allowNull: false,
      },
    },
    {
      tableName: 'TaskCollaborators',
      timestamps: true,
      paranoid: true,
    },
);

export default TaskCollaborator;
