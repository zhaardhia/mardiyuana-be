"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const {
  parent
} = require("../../components/database");

exports.getParentByUsername = async (username) => {
  return parent.findOne({
    raw:true,
    where: {
      username
    }
  })
}

exports.updateParentRefreshToken = async (userId, refresh_token) => {
  return parent.update(
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

exports.getParentRefreshToken = async (refresh_token) => {
  return parent.findAll({
    raw: true,
    where: {
      refresh_token
    }
  })
}
