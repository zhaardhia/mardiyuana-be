const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('event', {
    id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    eventVoteType: {
      type: DataTypes.ENUM('VOTE','NO_VOTE'),
      allowNull: false
    },
    eventDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING(255),
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
    tableName: 'event',
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
