'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    name: DataTypes.STRING(100),
    email: {
      type: DataTypes.STRING(100),
      unique: 'email'
    },
    fund_name: DataTypes.STRING(100),
    country: DataTypes.STRING(100),
    city: DataTypes.STRING(100),
    street: DataTypes.STRING(100),
    suite: DataTypes.STRING(100),
    house: DataTypes.STRING(100),
    phone: {
      type: DataTypes.STRING(100),
    //  unique: 'phone'
    },
    profile_image: DataTypes.STRING(100),
    user_type: {
      type: DataTypes.SMALLINT,
      defaultValue: 2 // [1:Admin 2: Investor 3: Traders]
    },
    otp : {
      type: DataTypes.STRING(10)
    },
    step_completed: {
      type: DataTypes.SMALLINT,
      defaultValue: 1 // [1:Personal info 2: fund 3: password 4: email confirmation]
    },
    password: DataTypes.STRING(100),
    status: {
      type: DataTypes.SMALLINT,
      defaultValue: 3 // [3:Inactive/Incomplete 2: Pending 1: Active 0: Deleted]
    }
  }, {
    underscored: true,
  });
  user.associate = function(models) {
    // associations can be defined here
   // user.hasMany(models.report_user,  {foreignKey:'report_by'})

  };
  return user;
};