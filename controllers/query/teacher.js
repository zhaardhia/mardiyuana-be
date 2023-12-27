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

exports.getListTeacherAdminByStatus = async (page, pageSize, teacherName, status) => {
  return teacher.findAll({
    limit: pageSize + 1,
    offset: (page - 1) * pageSize,
    order: [['createdDate', 'DESC']],
    raw: true,
    attributes: ["id", "fullname", "name", "username", "email", "phone", "status", "bornIn", "bornAt", "createdDate"],
    where: {
      ...(status && {
        status
      }),
      ...(teacherName && {
        fullname: {
          [Op.like]: `%${teacherName}%`, // Case-insensitive search for name
        },
      })  
    }
  })
}

exports.totalCountListTeacherAdminByStatus = async (status, teacherName) => {
  return teacher.count({
    where: {
      ...(status && {
        status
      }),
      ...(teacherName && {
        fullname: {
          [Op.like]: `%${teacherName}%`, // Case-insensitive search for name
        },
      })  
    }
  })
}