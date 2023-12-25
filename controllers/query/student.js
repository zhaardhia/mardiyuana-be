"use strict";

const sequelize = require("sequelize");
// const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op, literal, QueryTypes } = sequelize;
const { 
  student, parent, enrollment_student
} = require("../../components/database");

exports.totalCountListStudentAdmin = async (academicYearId, studentName) => {
  const parentAssociate = student.hasOne(parent, {foreignKey: "id", sourceKey: "parentId"})
  const enrollmentStudentAssociate = student.hasOne(enrollment_student, {foreignKey: "studentId", sourceKey: "id"})
  // const enrollmentStudentAssociate = student.belongsTo(enrollment_student, { foreignKey: "id" });

  return student.count({
    include: [
      {
        association: parentAssociate,
        // attributes: ["id", "fullname", "phone"],
        // required: true,
      },
      {
        association: enrollmentStudentAssociate,
        // attributes: ["id", "className", "status"],
        where: {
          // Additional conditions for the parent association
          academicYearId,
          status: "ACTIVE"
        },
        // required: true,
      },
    ],
    // raw: true,
    where: {
      status: "ACTIVE",
      ...(studentName && {
        fullname: {
          [Op.like]: `%${studentName}%`, // Case-insensitive search for name
        },
      })  
    }
  })
}

exports.getListStudentAdminEnrolled = async (page, pageSize, studentName, academicYearId) => {
  const parentAssociate = student.hasOne(parent, {foreignKey: "id", sourceKey: "parentId"})
  const enrollmentStudentAssociate = student.hasOne(enrollment_student, {foreignKey: "studentId", sourceKey: "id"})
  return student.findAll({
    limit: pageSize + 1,
    offset: (page - 1) * pageSize,
    order: [['createdDate', 'DESC']],
    // raw: true,
    include: [
      {
        association: parentAssociate,
        attributes: ["id", "fullname", "phone"],
        // required: true,
      },
      {
        association: enrollmentStudentAssociate,
        attributes: ["id", "className"],
        where: {
          // Additional conditions for the parent association
          academicYearId,
          status: "ACTIVE"
        },
        // required: true,
      },
    ],
    attributes: ["id", "fullname", "createdDate", "bornIn", "bornAt"],
    where: {
      status: "ACTIVE",
      ...(studentName && {
        fullname: {
          [Op.like]: `%${studentName}%`, // Case-insensitive search for name
        },
      })  
    }
  })
}

exports.getListStudentAdminNotEnrolled = async (page, pageSize, studentName, academicYearId) => {
  const parentAssociate = student.hasOne(parent, { foreignKey: "id", sourceKey: "parentId" });

  const sqlQuery = `
    SELECT student.id, student.fullname, student.createdDate, student.bornIn, student.bornAt, parent.id AS parentId, parent.fullname AS parentName, parent.phone AS parentPhone
    FROM student
    LEFT JOIN parent ON student.parentId = parent.id
    WHERE student.status = 'ACTIVE'
      AND student.id NOT IN (
        SELECT studentId
        FROM enrollment_student
        WHERE academicYearId = :academicYearId
      )
      ${studentName ? 'AND student.fullname LIKE :studentName' : ''}
    ORDER BY student.createdDate DESC
    LIMIT :pageSize OFFSET :offset
  `;
  
  const replacements = {
    academicYearId,
    studentName: studentName ? `%${studentName}%` : null,
    pageSize: pageSize + 1,
    offset: (page - 1) * pageSize,
  };

  const results = await db.query(sqlQuery, {
    type: QueryTypes.SELECT,
    replacements,
    // model: student,
  });

  return results;
};

exports.totalCountListStudentAdminNotEnrolled = async (academicYearId, studentName) => {
  const sqlQuery = `
    SELECT COUNT(*) as count
    FROM student
    LEFT JOIN parent ON student.parentId = parent.id
    WHERE student.status = 'ACTIVE'
      AND student.id NOT IN (
        SELECT studentId
        FROM enrollment_student
        WHERE academicYearId = :academicYearId
      )
    ${studentName ? 'AND student.fullname LIKE :studentName' : ''}
  `;
  
  const replacements = {
    academicYearId,
    studentName: studentName ? `%${studentName}%` : null,
    // pageSize: pageSize + 1,
    // offset: (page - 1) * pageSize,
  };

  const results = await db.query(sqlQuery, {
    type: QueryTypes.SELECT,
    replacements,
    // model: student,
  });
  
  return results;
};

exports.getListStudentAdminByStatus = async (page, pageSize, studentName, status) => {
  const parentAssociate = student.hasOne(parent, {foreignKey: "id", sourceKey: "parentId"})
  return student.findAll({
    limit: pageSize + 1,
    offset: (page - 1) * pageSize,
    order: [['createdDate', 'DESC']],
    // raw: true,
    include: [
      {
        association: parentAssociate,
        attributes: ["id", "fullname", "phone"],
        // required: true,
      },
    ],
    attributes: ["id", "fullname", "createdDate", "bornIn", "bornAt"],
    where: {
      status,
      ...(studentName && {
        fullname: {
          [Op.iLike]: `%${studentName}%`, // Case-insensitive search for name
        },
      })  
    }
  })
}

exports.totalCountListStudentAdminByStatus = async (status, studentName) => {
  return student.count({
    where: {
      status,
      ...(studentName && {
        fullname: {
          [Op.iLike]: `%${studentName}%`, // Case-insensitive search for name
        },
      })  
    }
  })
}
