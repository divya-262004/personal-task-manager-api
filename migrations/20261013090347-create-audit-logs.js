'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AuditLogs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      performedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      action: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      resourceType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      resourceId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      oldValues: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      newValues: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex(
        'AuditLogs',
        ['performedBy'],
    );

    await queryInterface.addIndex(
        'AuditLogs',
        ['resourceType', 'resourceId'],
    );

    await queryInterface.addIndex(
        'AuditLogs',
        ['createdAt'],
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AuditLogs');
  },
};
