const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('announcement', {
    id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
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
    tableName: 'announcement',
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
