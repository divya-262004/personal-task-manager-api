'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TaskReminders', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      taskId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Task',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

      minutesBefore: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      remindAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM(
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

      sentAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('TaskReminders');
    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_TaskReminders_status";',
    );
  },
};
