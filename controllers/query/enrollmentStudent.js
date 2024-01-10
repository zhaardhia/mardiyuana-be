"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { enrollment_student } = require("../../components/database");
const { nanoid } = require("nanoid");

exports.getClassAndAcademicYearByEnrollmentId = async ({ id }) => {
  return enrollment_student.findOne({
    raw: true,
    where: {
      id
    },
    attributes: ["id", "classId", "className", "academicYearId", "academicYear"]
  })
}
exports.checkEnrollmentStudentIsRegistered = async (studentId, academicYearId) => {
  return enrollment_student.findOne({
    raw: true,
    where: {
      studentId,
      academicYearId
    },
    attributes: ["id", "studentId", "academicYearId"]
  })
}

exports.insertEnrollmentStudent = async ({
  studentId,
  studentName,
  classId,
  className,
  academicYearId,
  academicYear,
}) => {
  return enrollment_student.create({
    id: nanoid(36),
    studentId,
    studentName,
    classId,
    className,
    status: "ACTIVE",
    academicYearId,
    academicYear,
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
  status
}) => {
  return enrollment_student.update(
    {
      classId,
      className,
      academicYearId,
      academicYear,
      ...(status && { status }),
      updatedDate: new Date()
    }, 
    {
      where: {
        id
      }
    }
  )
}

exports.getLastEnrollmentStudentGraduate = async ({
  studentId
}) => {
  return enrollment_student.findOne({
    raw: true,
    order: [['createdDate', 'DESC']],
    where: {
      status: {
        [Op.in]: ["GRADUATED", "ACTIVE"]
      },
      studentId
    }
  })
}


// Student Side
exports.getAllEnrollmentStudentByStudentId = async ({
  studentId,
}) => {
  console.log({studentId})
  return enrollment_student.findAll({
    raw: true,
    where: {
      studentId,
      status: {
        [Op.in]: ["GRADUATED", "ACTIVE"]
      },
    },
    attributes: { exclude: ['createdDate', 'updatedDate', 'studentId'] },
    order: [["createdDate", "DESC"]]
  })
}

exports.getActiveEnrollmentStudentByStudentId = async ({
  studentId,
}) => {
  console.log({studentId})
  return enrollment_student.findOne({
    raw: true,
    where: {
      studentId,
      status: "ACTIVE"
    },
  })
}

exports.getAllEnrollmentStudentByClassIdForInsertScore = async ({
  classId, academicYearId
}) => {
  return enrollment_student.findAll({
    raw: true,
    where: {
      status: "ACTIVE",
      classId,
      academicYearId
    }
  })
}

exports.checkEnrollmentStudentGrade = async (studentId, academicYearId) => {
  return enrollment_student.findOne({
    raw: true,
    where: {
      studentId,
      academicYearId
    },
    attributes: ["id", "studentId", "classId", "className"]
  })
}
