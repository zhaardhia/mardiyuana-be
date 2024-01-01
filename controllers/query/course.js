"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  course
} = require("../../components/database");

exports.checkCourseStatus = async (courseIdentifier, grade) => {
  return course.findOne({
    raw: true,
    where: {
      courseIdentifier,
      grade: Number(grade)
    }
  })
}

exports.checkCourseStatusByCourseId = async (courseId) => {
  return course.findOne({
    raw: true,
    where: {
      id: courseId
    }
  })
}

exports.getAllCourse = async (curriculumId) => {
  return course.findAll({
    raw: true,
    where: {
      curriculumId
    },
    attributes: { exclude: ['createdDate', 'updatedDate'] }
  })
}

exports.getAllCourseByCurriculumIdAndGrade = async ({ curriculumId, grade }) => {
  return course.findAll({
    raw: true,
    where: {
      curriculumId,
      grade
    },
    attributes: { exclude: ['createdDate', 'updatedDate'] }
  })
}
