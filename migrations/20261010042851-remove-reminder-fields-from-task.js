'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('Task', 'isMailSent');
    await queryInterface.removeColumn('Task', 'reminderAt');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Task', 'reminderAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Task', 'isMailSent', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },
};
