"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { enrollment_student } = require("../../components/database");
const { nanoid } = require("nanoid");

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
  classId,
  className,
  academicYearId,
  academicYear,
}) => {
  return enrollment_student.create({
    id: nanoid(36),
    studentId,
    classId,
    className,
    status: "ACTIVE",
    academicYearId,
    academicYear,
    createdDate: new Date(),
    updatedDate: new Date()
  })
}
