"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  course_module
} = require("../../components/database");

exports.checkCourseModuleNumberModule = async (courseSectionId, number, typeModule) => {
  return course_module.findOne({
    raw: true,
    where: {
      courseSectionId,
      numberModule: number,
      type: typeModule
    }
  })
}

exports.getAllCourseModuleByCourseSectionId = async (id, type) => {
  return course_module.findAll({
    raw: true,
    where: {
      courseSectionId: id,
      ...(type && {
        type
      })
    },
    order: [['numberModule', 'ASC']]
  })
}
