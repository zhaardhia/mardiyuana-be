const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reminder_course', {
    id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    academicYearId: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    courseSectionId: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    numberSection: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    classId: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    className: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    teacherId: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    teacherName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(100),
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
    tableName: 'reminder_course',
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
