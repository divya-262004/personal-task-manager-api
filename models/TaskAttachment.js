import {DataTypes} from 'sequelize';
import sequelize from '../connection/database.js';

const TaskAttachment=sequelize.define('TaskAttachment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  originalName: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  objectKey: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
},
{
  tableName: 'TaskAttachments',
  timestamps: true,
  paranoid: true,
},

);

export default TaskAttachment;
