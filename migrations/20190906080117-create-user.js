'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100)
      },
      email: {
        type: Sequelize.STRING(100),
        unique: true
      },
      username: {
        type: Sequelize.STRING(100),
        unique: true
      },
      password: {
        type: Sequelize.STRING(100)
      },
      phone: {
        type: Sequelize.STRING(100),
        unique: true
      },
      profile_image: {
        type: Sequelize.STRING(100)
      },
      cover_image: {
        type: Sequelize.STRING(100)
      },
      bio :{
        type: Sequelize.TEXT
      },
      date_of_birth :{
        type: Sequelize.DATEONLY
      },
      location :{
        type: Sequelize.STRING(100)
      },
      external_link :{
        type: Sequelize.STRING(100)
      },
      count_followers :{
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      count_followings :{
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      user_type: {
        type: Sequelize.SMALLINT,
        defaultValue: 2 //[1:Admin 2: User]
      },
      otp : {
        type: Sequelize.STRING(10)
      },
      allow_push_notifications : {
        type: Sequelize.SMALLINT,
        defaultValue: 1 //[0:No 1:Yes]
      },
      allow_email_notifications : {
        type: Sequelize.SMALLINT,
        defaultValue: 0 //[0:No 1:Yes]
      },
      status: {
        type: Sequelize.SMALLINT,
        defaultValue: 3 // [3:Inactive/Incomplete 2: Pending 1: Active 0: Deleted]
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
    return queryInterface.dropTable('users');
  }
};