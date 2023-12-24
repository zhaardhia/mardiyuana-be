"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  teacher
} = require("../../components/database");

exports.checkTeacherFullname = async (id) => {
  return teacher.findOne({
    raw: true,
    where: {
      id,
      status: "ACTIVE"
    },
    attributes: ["id", "fullname"]
  })
}
