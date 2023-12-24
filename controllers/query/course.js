"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  course
} = require("../../components/database");

exports.checkCourseStatus = async (id) => {
  return course.findOne({
    raw: true,
    where: {
      id
    }
  })
}
