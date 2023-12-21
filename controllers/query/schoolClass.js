"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  school_class
} = require("../../components/database");

exports.checkSchoolClassStatus = async (classId) => {
  return school_class.findOne({
    raw: true,
    where: {
      id: classId,
      status: "ACTIVE"
    }
  })
}
