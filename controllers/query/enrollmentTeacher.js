"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { enrollment_teacher, course } = require("../../components/database");
const { nanoid } = require("nanoid");

exports.checkEnrollmentTeacherIsRegistered = async (academicYearId, classId, courseId) => {
  return enrollment_teacher.findOne({
    raw: true,
    where: {
      academicYearId,
      classId,
      courseId
    },
    attributes: ["id", "teacherId", "academicYearId"]
  })
}

exports.checkEnrollmentTeacherHomeroomIsRegistered = async (academicYearId, classId) => {
  return enrollment_teacher.findOne({
    raw: true,
    where: {
      academicYearId,
      classId,
      teacherType: "HOMEROOM"
    },
    attributes: ["id", "teacherId", "academicYearId"]
  })
}

exports.checkTeacherIsAlreadyRegisteredAsHomeroom = async (teacherId, academicYearId) => {
  return enrollment_teacher.findOne({
    raw: true,
    where: {
      academicYearId,
      teacherId,
      teacherType: "HOMEROOM"
    },
    attributes: ["id", "teacherId", "academicYearId"]
  })
}

exports.insertEnrollmentTeacher = async ({
  teacherId,
  teacherName,
  academicYearId,
  academicYear,
  classId,
  className,
  courseId,
  courseName,
  teacherType,
}) => {
  return enrollment_teacher.create({
    id: nanoid(36),
    teacherId,
    teacherName,
    academicYearId,
    academicYear,
    classId,
    className,
    ...(courseId && { courseId, courseName }),
    teacherType,
    status: "ACTIVE",
    createdDate: new Date(),
    updatedDate: new Date()
  })
}

exports.updateClassOrAcademicYearEnrollmentStudent = async ({
  id,
  classId,
  className,
  academicYearId,
  academicYear,
}) => {
  return enrollment_teacher.update(
    {
      classId,
      className,
      academicYearId,
      academicYear,
      updatedDate: new Date()
    }, 
    {
      where: {
        id
      }
    }
  )
}

exports.getAllEnrollAcademicTeacher = async () => {
  return enrollment_teacher.findAll({
    raw: true,
    attributes: ["id", "academicYearId", "academicYear"]
  })
}

exports.getAllEnrollTeacherByAcademicYear = async (academicYearId, teacherId) => {
  return enrollment_teacher.findAll({
    raw: true,
    order: [['createdDate', 'DESC']],
    where: {
      academicYearId,
      teacherId
    },
    attributes: ["id", "academicYearId", "academicYear", "classId", "className", "courseId", "courseName", "status", "teacherType"]
  })
}

exports.getAllEnrollTeacherAndCourseByAcademicYear = async (academicYearId, teacherId) => {
  const courseAssociate = enrollment_teacher.hasOne(course, {foreignKey: "id", sourceKey: "courseId"})
  return enrollment_teacher.findAll({
    include: [
      {
        association: courseAssociate,
        attributes: ["id", "courseIdentifier", "name", "grade"],
        required: false,
      },
    ],
    // raw: true,
    order: [['createdDate', 'DESC']],
    where: {
      academicYearId,
      // teacherId,
      teacherType: "NORMAL"
    },
    attributes: ["id", "academicYearId", "academicYear", "classId", "className", "courseId", "courseName", "status", "teacherType"]
  })
}

exports.getAllEnrollTeacherHomeroomByAcademicYear = async (academicYearId, teacherId) => {
  return enrollment_teacher.findAll({
    raw: true,
    where: {
      academicYearId,
      teacherId,
      teacherType: "HOMEROOM"
    },
    attributes: ["id", "academicYearId", "academicYear", "classId", "className", "status", "teacherType"]
  })
}

exports.getAllEnrolledTeacherClassByAcademicYear = async (academicYearId, teacherId) => {
  return enrollment_teacher.findAll({
    raw: true,
    where: {
      academicYearId,
      teacherId,
      teacherType: "NORMAL"
    },
    attributes: ["id", "academicYearId", "academicYear", "classId", "className", "status", "teacherType", "courseId", "courseName"]
  })
}

exports.getActiveHomeroomTeacher = async ({ academicYearId, teacherId }) => {
  return enrollment_teacher.findOne({
    raw: true,
    where: {
      academicYearId,
      teacherId,
      teacherType: "HOMEROOM",
      status: "ACTIVE"
    },
    attributes: ["id", "teacherId", "teacherName", "academicYearId", "academicYear", "classId", "className", "teacherType"]
  })
}
