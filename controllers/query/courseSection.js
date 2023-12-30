"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  course_section
} = require("../../components/database");

exports.checkCourseSectionNumberSection = async (courseId, number) => {
  return course_section.findOne({
    raw: true,
    where: {
      courseId,
      numberSection: number
    }
  })
}

exports.checkCourseSectionAvail = async (id) => {
  return course_section.findOne({
    raw: true,
    where: {
      id
    }
  })
}

exports.getAllCourseSectionById = async (courseId) => {
  return course_section.findAll({
    raw: true,
    where: {
      courseId
    },
    order: [['numberSection', 'ASC']]
  })
}
