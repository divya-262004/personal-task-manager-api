import {DataTypes} from 'sequelize';
import sequelize from '../connection/database.js';

const GoogleCalendarConnection = sequelize.define(
    'GoogleCalendarConnection',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'User',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      refreshToken: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: 'GoogleCalendarConnections',
      timestamps: true,
    },
);

export default GoogleCalendarConnection;
