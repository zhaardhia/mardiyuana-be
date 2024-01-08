const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('score_course_student', {
    id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    scoreCourseId: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('DONE','NOT_DONE'),
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('ASSIGNMENT','DAILY_EXAM','MID_EXAM','FINAL_EXAM'),
      allowNull: false
    },
    studentId: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    courseId: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    classId: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    academicYearId: {
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
    tableName: 'score_course_student',
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
