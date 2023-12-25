"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  admin,
} = require("../../components/database");

exports.getOperatorByUsername = async (username) => {
  return admin.findOne({
    raw:true,
    where: {
      username
    }
  })
}

exports.updateRefreshToken = async (userId, refresh_token) => {
  return admin.update(
    {
      refresh_token
    },
    {
      where: {
        id: userId
      }
    }
  )
}

exports.getRefreshToken = async (refresh_token) => {
  return admin.findAll({
    raw: true,
    where: {
      refresh_token
    }
  })
}
