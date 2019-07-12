module.exports = function(sequelize, DataTypes) {
  var Users = sequelize.define('Users', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 140]
      }
    }
    // password: {
    //   type: DataTypes.STRING,
    //   // allowNull: false,
    //   validate: {
    //     len: [1, 140]
    //   }
    // },
    // treasurePoint: {
    //   type: DataTypes.INTEGER,
    //   defaultValue: 0
    // },
    // bestTime: {
    //   type: DataTypes.INTEGER,
    //   defaultValue: 0
    // }
  });
  return Users;
};
