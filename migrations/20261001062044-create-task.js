'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Task',{
      id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true
      },
      title:{
        type:Sequelize.STRING,
        allowNull:false
      },
      description:{
        type:Sequelize.TEXT,
        allowNull:true
      },
      priority:{
        type:Sequelize.STRING,
        allowNull:false
      },
      dueDate:{
        type:Sequelize.DATE,
        allowNull:false
      },
      status:{
        type:Sequelize.STRING,
        allowNull:false
      },
      userId:{
        type:Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:'User',
          key:'id'
        }
      },
      updatedAt:{
        type:Sequelize.DATE,
        allowNull:false
      },
      createdAt:{
        type:Sequelize.DATE,
        allowNull:false
      }
    })

    await queryInterface.addConstraint('Task',{
      fields:['priority'],
      type:'check',
      where:{
        priority:['low', 'medium', 'high']
      },
      name:'task_priority_check'
    });

    await queryInterface.addConstraint('Task', {
      fields: ['status'],
      type: 'check',
      where: {
        status: ['pending', 'completed']
      },
      name: 'task_status_check'
    });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
