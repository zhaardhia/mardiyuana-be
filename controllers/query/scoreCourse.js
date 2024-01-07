"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  score_course,
  score_course_student
} = require("../../components/database");

exports.insertScoreCourse = async (payload) => {
  console.log({payloadSchoolCourse: payload})
  return score_course.create({
    ...payload
  })
}
exports.insertScoreCourseStudent = async (payload, dbTransaction) => {
  return score_course_student.bulkCreate(payload, { transaction: dbTransaction })
}

exports.updateScoreCourse = async ({ id, payload }) => {
  return score_course.update(
    payload,
    {
      where: { id }
    }
  )
}

exports.getAllSchoolCourse = async ({ type, academicYearId, classId, courseId }) => {
  return score_course.findAll({
    raw: true,
    where: { type, academicYearId, classId, courseId },
    attributes: ["id", "title", "scoreDue", "updatedDate"]
  })
}

exports.getSchoolCourseDetail = async ({ id }) => {
  return score_course.findOne({
    raw: true,
    where: { id },
    attributes: { exclude: ["updatedDate", "academicYearId"] }
  })
}

// exports.getSchoolCourseDetail = async ({ id }) => {
//   return score_course.findOne({
//     raw: true,
//     where: { id }
//   })
// }
