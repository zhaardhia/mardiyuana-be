const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('score_course', {
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
    type: {
      type: DataTypes.ENUM('ASSIGNMENT','DAILY_EXAM','MID_EXAM','FINAL_EXAM'),
      allowNull: false
    },
    scoreDue: {
      type: DataTypes.DATE,
      allowNull: false
    },
    academicYearId: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    classId: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    courseId: {
      type: DataTypes.STRING(36),
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
    tableName: 'score_course',
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
