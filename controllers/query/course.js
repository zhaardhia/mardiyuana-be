"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  course, enrollment_teacher, enrollment_student, course_section, course_module
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

exports.getCourseByGradeAndCurriculum = async ({ grade, curriculumId }) => {
  return course.findAll({
    raw: true,
    where: {
      curriculumId,
      grade
    },
    attributes: { exclude: ["createdDate", "updatedDate", "curriculumName"] }
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

exports.getAllCourseByCurriculumIdAndGrade = async ({ curriculumId, academicYearId, grade, className }) => {
  const enrollTeacherAssociate = course.hasOne(enrollment_teacher, {foreignKey: "courseId", sourceKey: "id"})
  // const enrollStudentAssociate = enrollment_student.hasOne(course, {foreignKey: "courseId", sourceKey: "id"})

  return course.findAll({
    // raw: true,
    include: [
      {
        association: enrollTeacherAssociate,
        attributes: ["id", "teacherId", "teacherName", "className", "academicYear", "academicYearId", "status"],
        where: {
          academicYearId,
          status: "ACTIVE",
          className
        },
        required: true,
      },
    ],
    where: {
      curriculumId,
      grade
    },
    attributes: { exclude: ['createdDate', 'updatedDate'] }
  })
}

exports.getCourseDetailById = async ({ id }) => {
  const courseSectionAssociate = course.hasMany(course_section, {foreignKey: "courseId", sourceKey: "id"})
  const courseModuleAssociate = course_section.hasMany(course_module, {foreignKey: "courseSectionId", sourceKey: "id"})

  const result = await course.findOne({
    include: [
      {
        association: courseSectionAssociate,
        attributes: ["id", "courseId", "numberSection", "name", "description"],
        // required: true,
        include: [
          {
            association: courseModuleAssociate,
            attributes: ["id", "courseSectionId", "numberModule", "content", "url", "type"],
            // required: true,
          }
        ],
        // order: [['numberSection', 'ASC']]
      },
    ],
    where: {
      id
    },
    attributes: { exclude: ['createdDate', 'updatedDate'] }
  })
  console.log({result})
  const resultJSON = result ? result.toJSON() : null;
  return resultJSON;
}

exports.getInitialCourseDetailById = async ({ id }) => {
  const courseSectionAssociate = course.hasMany(course_section, {foreignKey: "courseId", sourceKey: "id"})

  const result = await course.findOne({
    include: [
      {
        association: courseSectionAssociate,
        attributes: ["id", "courseId", "name", "numberSection"],        
        order: [['numberSection', 'ASC']]
      },
    ],
    where: {
      id
    },
    attributes: ['id', 'name', "courseidentifier", 'grade']
  })
  console.log({result})
  const resultJSON = result ? result.toJSON() : null;
  return resultJSON;
}

exports.getCourseSectionsAndModules = async ({ courseId }) => {
  const courseModuleAssociate = course_section.hasMany(course_module, {foreignKey: "courseSectionId", sourceKey: "id"})

  const result = await course_section.findAll({
    include: [
      {
        association: courseModuleAssociate,
        attributes: ["id", "courseSectionId", "numberModule", "content", "url", "type"],
        // required: true,
        // order: [['numberSection', 'ASC']]
      },
    ],
    where: {
      courseId
    },
    attributes: { exclude: ['createdDate', 'updatedDate'] },
    order: [['numberSection', 'ASC']]
  })
  console.log({result})
  const resultJSON = result ? result.map(result => result.toJSON()) : null;
  return resultJSON;
}
