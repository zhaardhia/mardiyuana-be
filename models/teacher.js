const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('teacher', {
    id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    fullname: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('ACTIVE','INACTIVE'),
      allowNull: false,
      defaultValue: "ACTIVE"
    },
    photo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    bornIn: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    bornAt: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    startAt: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endAt: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    refresh_token: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    forgotPasswordToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    forgotPasswordTokenExpiredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'teacher',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
