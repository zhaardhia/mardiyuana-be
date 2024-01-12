"use strict";

const sequelize = require("sequelize");
// const Sequelize = require("sequelize")
const { db } = require("../../components/database")
const { Op, literal, QueryTypes } = sequelize;
const { 
  student, parent, enrollment_student
} = require("../../components/database");

exports.getStudentById = async (id) => {
  return student.findOne({
    raw:true,
    where: {
      id
    }
  })
}

exports.getStudentProfileById = async (id) => {
  return student.findOne({
    raw:true,
    where: {
      id
    },
    attributes: ["id", "fullname", "name", "email", "username", "phone"]
  })
}

exports.updatePassword = async (userId, password) => {
  return student.update(
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

exports.checkExistingStudent = async (id) => {
  return student.findOne({
    raw: true,
    where: {
      id,
      status: "ACTIVE"
    },
    attributes: ["id"]
  })
}

exports.getStudentName = async ({ studentId }) => {
  return student.findOne({
    raw: true,
    where: {
      id: studentId
    },
    attributes: ["id", "fullname"]
  })
}


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
        attributes: ["id", "fullname", "name", "email", "username", "bornIn", "bornAt", "phone"],
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
    attributes: ["id", "fullname", "name", "email", "username", "createdDate", "bornIn", "bornAt", "phone"],
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
//["id", "fullname", "name", "email", "username", "bornIn", "bornAt", "phone"]
  const sqlQuery = `
    SELECT 
    student.id, student.fullname, student.name, student.email, student.username, student.createdDate, student.bornIn, student.bornAt, student.phone, parent.id AS parentId, parent.fullname AS parentFullname, parent.name AS parentName, parent.email AS parentEmail, parent.username AS parentUsername, parent.phone AS parentPhone, parent.createdDate AS parentCreatedDate, parent.bornIn AS parentBornIn, parent.bornAt AS parentBornAt
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

exports.getDetailStudentAdminEnrolled = async (id) => {
  const parentAssociate = student.hasOne(parent, {foreignKey: "id", sourceKey: "parentId"})
  const enrollmentStudentAssociate = student.hasMany(enrollment_student, {foreignKey: "studentId", sourceKey: "id"})
  return student.findOne({
    // raw: true,
    include: [
      {
        association: parentAssociate,
        attributes: ["id", "fullname", "name", "email", "phone", "bornIn", "bornAt", "createdDate"],
        // required: true,
      },
      {
        association: enrollmentStudentAssociate,
        attributes: ["id", "className", "academicYear", "academicYearId", "status"],
        // where: {
        //   // Additional conditions for the parent association
        //   // academicYearId,
        //   // status: "ACTIVE"
        // },
        // required: true,
      },
    ],
    attributes: ["id", "fullname", "name", "email", "phone", "status", "createdDate", "bornIn", "bornAt", "startAcademicYear", "endAcademicYear"],
    where: {
      id
    }
  })
}


// Student Side

exports.getStudentByUsername = async (username) => {
  return student.findOne({
    raw:true,
    where: {
      username
    }
  })
}

exports.updateStudentRefreshToken = async (userId, refresh_token) => {
  return student.update(
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

exports.getStudentRefreshToken = async (refresh_token) => {
  return student.findAll({
    raw: true,
    where: {
      refresh_token
    }
  })
}

exports.getListStudentsInHomeroomPage = async ({ page, pageSize, studentName, academicYearId, classId }) => {
  console.log({classId})
  const studentAssociate = enrollment_student.hasOne(student, {foreignKey: "id", sourceKey: "studentId"})
  return enrollment_student.findAll({
    limit: pageSize + 1,
    offset: (page - 1) * pageSize,
    order: [['createdDate', 'DESC']],
    // raw: true,
    include: [
      {
        association: studentAssociate,
        attributes: ["id", "email", "phone"],
        where: {
          // Additional conditions for the parent association
          // academicYearId,
          status: "ACTIVE"
        },
        // required: true,
      },
    ],
    attributes: ["id", "studentId", "studentName", "classId"],
    where: {
      classId,
      academicYearId,
      ...(studentName && {
        studentName: {
          [Op.like]: `%${studentName}%`, // Case-insensitive search for name
        },
      })  
    }
  })
}

exports.totalCountListStudentInHomeroomPage = async ({ studentName, academicYearId, classId }) => {
  return enrollment_student.count({
    where: {
      classId,
      academicYearId,
      ...(studentName && {
        studentName: {
          [Op.iLike]: `%${studentName}%`, // Case-insensitive search for name
        },
      })  
    }
  })
}

exports.getStudentAndParent = async ({ studentId }) => {
  return student.findOne({
    raw: true,
    where: {
      id: studentId
    },
    attributes: ["id", "parentId"]
  })
}
