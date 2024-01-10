"use strict";

const sequelize = require("sequelize");
const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op } = sequelize;
const { 
  teacher_note,
  school_class
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

exports.getListTeacherNotesOnParent = async ({ academicYearId, classId, parentId, studentId }) => {
  const classAssociate = teacher_note.hasOne(school_class, {foreignKey: "id", sourceKey: "classId"})
  return teacher_note.findAll({
    include: [
      {
        association: classAssociate,
        attributes: ["id", "name"]
      }
    ],
    attributes: { exclude: ["updatedDate"]},
    where: {
      academicYearId,
      ...(classId && { classId }),
      parentId,
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
