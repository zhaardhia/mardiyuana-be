"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  reminder_course, course_section, course
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
  const courseSectionAssociate = reminder_course.hasOne(course_section, {foreignKey: "id", sourceKey: "courseSectionId"})
  const courseAssociate = course_section.hasOne(course, {foreignKey: "id", sourceKey: "courseId"})

  return reminder_course.findOne({
    include: [
      {
        association: courseSectionAssociate,
        attributes: ["id", "courseId", "name", "numberSection"], 
        include: [
          {
            association: courseAssociate,
            attributes: ["id", "name"], 
          }
        ]
      },
    ],
    // raw: true,
    attributes: { exclude: ["updatedDate"]},
    where: {
      id
    }
  })
}
