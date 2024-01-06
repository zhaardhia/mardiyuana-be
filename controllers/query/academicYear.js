"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  academic_year,
} = require("../../components/database");

exports.checkAcademicYearIsRegistered = async (academicYearId) => {
  console.log({academicYearId})
  return academic_year.findOne({
    raw: true,
    where: {
      id: academicYearId
    }
  })
}

exports.checkAcademicYearThatActive = async () => {
  return academic_year.findOne({
    raw: true,
    where: {
      status: "ACTIVE"
    },
    attributes: ["id", "academicYear"]
  })
}

exports.getLatestFiveAcademicYear = async () => {
  return academic_year.findAll({
    raw: true,
    order: [['createdDate', 'DESC']],
    limit: 5
  })
}

exports.getDetailAcademicYear = async ({ academicYearId }) => {
  return academic_year.findOne({
    raw: true,
    where: {
      id: academicYearId
    },
    attributes: ["id", "academicYear", "status"]
  })
}
