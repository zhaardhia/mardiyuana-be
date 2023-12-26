"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  curriculum,
} = require("../../components/database");

exports.getCurriculumDetail = async (id) => {
  return curriculum.findOne({
    raw: true,
    where: {
      id
    },
  })
}

exports.getCurriculumActive = async () => {
  return curriculum.findOne({
    raw: true,
    where: {
      status: "ACTIVE"
    },
  })
}