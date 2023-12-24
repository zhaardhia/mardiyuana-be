"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  course_section
} = require("../../components/database");

exports.checkCourseSectionNumberSection = async (number) => {
  return course_section.findOne({
    raw: true,
    where: {
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
