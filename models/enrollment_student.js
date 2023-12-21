const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('enrollment_student', {
    id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    studentId: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    classId: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    className: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('ACTIVE','INACTIVE','GRADUATED'),
      allowNull: false
    },
    academicYearId: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    academicYear: {
      type: DataTypes.STRING(100),
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
    tableName: 'enrollment_student',
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
