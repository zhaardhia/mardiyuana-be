"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  announcement
} = require("../../components/database");

exports.getListAnnouncementTable = async ({ page, pageSize, searchName }) => {
  return announcement.findAll({
    limit: pageSize + 1,
    offset: (page - 1) * pageSize,
    order: [['createdDate', 'DESC']],
    raw: true,
    attributes: ["id", "title", "body", "createdDate", "updatedDate"],
    where: {
      ...(searchName && {
        title: {
          [Op.like]: `%${searchName}%`, // Case-insensitive search for name
        },
      })  
    }
  })
}

exports.totalCountAnnouncementListTable = async ({ searchName }) => {
  return announcement.count({
    where: {
      ...(searchName && {
        title: {
          [Op.like]: `%${searchName}%`, // Case-insensitive search for name
        },
      })  
    }
  })
}