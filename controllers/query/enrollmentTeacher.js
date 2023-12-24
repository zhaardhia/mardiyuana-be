"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { enrollment_teacher } = require("../../components/database");
const { nanoid } = require("nanoid");

exports.checkEnrollmentTeacherIsRegistered = async (teacherId, academicYearId, classId) => {
  return enrollment_teacher.findOne({
    raw: true,
    where: {
      teacherId,
      academicYearId,
      classId
    },
    attributes: ["id", "teacherId", "academicYearId"]
  })
}

exports.checkEnrollmentTeacherHomeroomIsRegistered = async (teacherId, academicYearId, classId) => {
  return enrollment_teacher.findOne({
    raw: true,
    where: {
      teacherId,
      academicYearId,
      classId,
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
  return enrollment_student.create({
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
  return enrollment_student.update(
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
