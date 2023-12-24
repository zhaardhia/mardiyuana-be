"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  course_module
} = require("../../components/database");

exports.checkCourseModuleNumberModule = async (number) => {
  return course_module.findOne({
    raw: true,
    where: {
      numberModule: number
    }
  })
}
