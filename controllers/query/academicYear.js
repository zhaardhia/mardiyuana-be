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
    }
  })
}
