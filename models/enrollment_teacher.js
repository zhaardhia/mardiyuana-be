const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('enrollment_teacher', {
    id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    teacherId: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    teacherName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    academicYearId: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    academicYear: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    classId: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    className: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    courseId: {
      type: DataTypes.STRING(36),
      allowNull: true
    },
    courseName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('ACTIVE','INACTIVE'),
      allowNull: false
    },
    teacherType: {
      type: DataTypes.ENUM('NORMAL','HOMEROOM'),
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
    tableName: 'enrollment_teacher',
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
