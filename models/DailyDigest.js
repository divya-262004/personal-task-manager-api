import {DataTypes} from 'sequelize';
import sequelize from '../connection/database.js';

const DailyDigest = sequelize.define(
    'DailyDigest',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      digestDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM(
            'pending',
            'processing',
            'sent',
            'failed',
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

      claimToken: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'daily_digests',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['userId', 'digestDate'],
          name: 'unique_user_daily_digest',
        },
      ],
    },
);

export default DailyDigest;
