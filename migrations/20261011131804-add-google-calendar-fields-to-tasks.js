'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Task', 'googleEventId', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Task', 'googleSyncStatus', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'not_synced',
    });

    await queryInterface.addColumn('Task', 'googleSyncError', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Task', 'googleSyncError');
    await queryInterface.removeColumn('Task', 'googleSyncStatus');
    await queryInterface.removeColumn('Task', 'googleEventId');
  },

};
