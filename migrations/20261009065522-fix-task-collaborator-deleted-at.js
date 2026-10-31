'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
        'TaskCollaborators',
        'deleteAt',
        'deletedAt',
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
        'TaskCollaborators',
        'deletedAt',
        'deleteAt',
    );
  },
};
