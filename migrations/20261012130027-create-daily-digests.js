'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('daily_digests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      digestDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
            'pending',
            'processing',
            'sent',
            'failed',
        ),
        allowNull: false,
        defaultValue: 'pending',
      },
      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      nextAttemptAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lockedUntil: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      claimToken: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    await queryInterface.addConstraint('daily_digests', {
      fields: ['userId', 'digestDate'],
      type: 'unique',
      name: 'unique_user_daily_digest',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('daily_digests');

    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_daily_digests_status";',
    );
  },
};
