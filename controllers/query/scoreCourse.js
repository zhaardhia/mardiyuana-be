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
    attributes: ["id", "title", "scoreDue", "updatedDate"],
    order: [["createdDate", "ASC"]]
  })
}

exports.getSchoolCourseDetail = async ({ id }) => {
  return score_course.findOne({
    raw: true,
    where: { id },
    attributes: { exclude: ["updatedDate", "academicYearId"] }
  })
}

exports.getListScoreCourseStudentPage = async (page, pageSize, scoreCourseId) => {
  const studentAssociate = score_course_student.hasOne(student, {foreignKey: "id", sourceKey: "studentId"})
  const classAssociate = score_course_student.hasOne(school_class, {foreignKey: "id", sourceKey: "classId"})

  return score_course_student.findAll({
    include: [
      {
        association: studentAssociate,
        attributes: ["id", "fullname"],
        // required: true,
      },
      {
        association: classAssociate,
        attributes: ["id", "name"],
        // required: true,
      }
    ],
    limit: pageSize + 1,
    offset: (page - 1) * pageSize,
    order: [['createdDate', 'DESC']],
    // raw: true,
    where: {
      scoreCourseId
    }
  })
}

exports.getDetailScoreCourseStudent = async (scoreCourseId, studentId) => {
  return score_course_student.findOne({
    raw: true,
    where: {
      scoreCourseId,
      studentId
    },
    attributes: ["id", "scoreCourseId", "score", "status", "type"]
  })
}

exports.totalCountListScoreCourseStudentPage = async (scoreCourseId) => {
  return score_course_student.count({
    where: {
      scoreCourseId
    }
  })
}

exports.editScoreCourseStudent = async ({ id, score, status }) => {
  return score_course_student.update(
    {
      score, status
    },
    {
      where: {
        id
      }
    }
  )
}
