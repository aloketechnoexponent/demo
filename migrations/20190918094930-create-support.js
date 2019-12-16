'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('supports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING(100)
      },
      name: {
        type: Sequelize.STRING(100)
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      message: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.SMALLINT,
        defaultValue : 1
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('supports');
  }
};