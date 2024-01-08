"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  score_course,
  score_course_student,
  student,
  school_class
} = require("../../components/database");

exports.getAllScoreStudentByType = async ({
  studentId, type, courseId, classId, academicYearId
}) => {
  return score_course_student.findAll({
    raw: true,
    where: {
      studentId,
      type,
      courseId,
      classId,
      academicYearId,
      status: "DONE"
    },
    attributes: ["id", "scoreCourseId", "score", "status", "type", "studentId", "courseId", "classId", "academicYearId", "createdDate"],
    order: [["createdDate", "DESC"]]
  })
}