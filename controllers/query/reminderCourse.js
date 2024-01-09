"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  reminder_course
} = require("../../components/database");

exports.getListReminderCourseBySectionAndAcademicYear = async ({ courseSectionId, academicYearId, numberSection, classId }) => {
  return reminder_course.findAll({
    raw: true,
    attributes: { exclude: ["updatedDate"]},
    where: {
      courseSectionId,
      academicYearId,
      classId
    }
  })
}

exports.insertReminderCourse = async (payload) => {
  return reminder_course.create({
    ...payload
  })
}

exports.updateReminderCourse = async ({ id, payload }) => {
  return reminder_course.update(
    payload,
    {
      where: {
        id
      }
    }
  )
}

exports.getDetailReminderCourseById = async ({ id }) => {
  return reminder_course.findOne({
    raw: true,
    attributes: { exclude: ["createdDate", "updatedDate"]},
    where: {
      id
    }
  })
}
