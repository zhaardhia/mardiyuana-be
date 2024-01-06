"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  teacher_note
} = require("../../components/database");

exports.getListTeacherNotesOnTeacher = async ({ academicYearId, classId, teacherId, studentId }) => {
  return teacher_note.findAll({
    raw: true,
    attributes: { exclude: ["createdDate", "updatedDate"]},
    where: {
      academicYearId,
      classId,
      teacherId,
      studentId
    }
  })
}

exports.insertTeacherNote = async (payload) => {
  return teacher_note.create({
    ...payload
  })
}

exports.updateTeacherNote = async ({ id, payload }) => {
  return teacher_note.update(
    payload,
    {
      where: {
        id
      }
    }
  )
}
