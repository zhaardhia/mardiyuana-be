"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  teacher
} = require("../../components/database");

exports.getTeacherById = async (id) => {
  return teacher.findOne({
    raw:true,
    where: {
      id
    }
  })
}

exports.getTeacherProfileById = async (id) => {
  return teacher.findOne({
    raw:true,
    where: {
      id
    },
    attributes: ["id", "fullname", "name", "email", "username", "phone", "startAt"]
  })
}

exports.updatePassword = async (userId, password) => {
  return teacher.update(
    {
      password,
      updatedDate: new Date()
    },
    {
      where: {
        id: userId
      }
    }
  )
}

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

exports.getDetailTeacherAdmin = async (id) => {
  return teacher.findOne({
    raw: true,
    attributes: ["id", "fullname", "name", "email", "phone", "status", "createdDate", "bornIn", "bornAt", "startAt", "endAt"],
    where: {
      id
    }
  })
}


// Teacher Side

exports.getTeacherByUsername = async (username) => {
  return teacher.findOne({
    raw:true,
    where: {
      username
    }
  })
}

exports.updateTeacherRefreshToken = async (userId, refresh_token) => {
  return teacher.update(
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

exports.getTeacherRefreshToken = async (refresh_token) => {
  return teacher.findAll({
    raw: true,
    where: {
      refresh_token
    }
  })
}

exports.getUserEmailByEmail = async ({ email }) => {
  return teacher.findOne({
    raw: true,
    where: { email },
    attributes: ["id", "email"]
  })
}

exports.updateForgotPassToken = async ({ userId, forgotPasswordToken, forgotPasswordTokenExpiredAt }) => {
  return teacher.update(
    {
      forgotPasswordToken,
      forgotPasswordTokenExpiredAt
    },
    {
      where: {
        id: userId
      }
    }
  )
}

exports.getTokenForgotPass = async ({ forgotPasswordToken }) => {
  return teacher.findOne({
    raw: true,
    where: {
      forgotPasswordToken,
    },
    attributes: ["id", "email", "forgotPasswordToken", "forgotPasswordTokenExpiredAt"]
  })
}

exports.changePassword = async ({ id, password }) => {
  return teacher.update(
    {
      password,
      forgotPasswordToken: null,
      forgotPasswordTokenExpiredAt: null
    },
    {
      where: {
        id
      }
    }
  )
}
