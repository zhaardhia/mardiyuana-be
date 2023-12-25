"use strict";

const response = require("../../components/response")
const { db, student } = require("../../components/database");
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken")
const { validationEmail } = require("../../middleware/validator")
const { GET_LIST_STUDENT_TABLE_ADMIN } = require("../../middleware/schema-validator")
const Validator = require("fastest-validator");
const v = new Validator();
const { 
  totalCountListStudentAdmin,
  totalCountListStudentAdminNotEnrolled,
  getListStudentAdminEnrolled,
  getListStudentAdminNotEnrolled,
  getListStudentAdminByStatus,
  totalCountListStudentAdminByStatus
} = require("../query/student")
const { 
  checkAcademicYearThatActive
} = require("../query/academicYear")

exports.listTableStudentAdmin = async (req, res, next) => {
  const payload = {
    page: Number(req.query.page) || undefined,
    pageSize: Number(req.query.pageSize) || undefined,
    studentName: req.query.studentName || '',
    filterBy: req.query.filterBy || '',
  }
  const payloadCheck = await v.compile(GET_LIST_STUDENT_TABLE_ADMIN);
  const resPayloadCheck = await payloadCheck(payload);

  if (resPayloadCheck !== true) {
    return response.res400(res, "Mohon cek kembali kelengkapan data yang telah dikirim.")
  }
  
  const { page, pageSize, studentName, filterBy } = payload

  try {
    let dataStudent = null;
    let totalCount = null;
    let getActiveAcademicYear = null
    switch (filterBy) {
      case "activeAcademicYear":
        getActiveAcademicYear = await checkAcademicYearThatActive();
        if (!getActiveAcademicYear) return response.res200(res, "001", "Tidak terdapat tahun ajaran yang sedang aktif")

        dataStudent = await getListStudentAdminEnrolled(page, pageSize, studentName, getActiveAcademicYear.id);
        totalCount = await totalCountListStudentAdmin(getActiveAcademicYear.id, studentName);
        console.log({totalCount})
        break;
      case "notRegisteredAcademicYear":
        getActiveAcademicYear = await checkAcademicYearThatActive();
        if (!getActiveAcademicYear) return response.res200(res, "001", "Tidak terdapat tahun ajaran yang sedang aktif")
        console.log({page, pageSize})
        dataStudent = await getListStudentAdminNotEnrolled(page, pageSize, studentName, getActiveAcademicYear.id);
        if (dataStudent.length > 0) {
          dataStudent = dataStudent?.map((data) => {
            
            return {
              id: data.id,
              fullname: data.fullname,
              createdDate: data.createdDate,
              bornIn: data.bornIn,
              bornAt: data.bornAt,
              parent: {
                id: data.parentId,
                fullname: data.parentName,
                phone: data.parentPhone
              }
            }
          })
        }
        console.log({dataStudent})
        totalCount = await totalCountListStudentAdminNotEnrolled(getActiveAcademicYear.id, studentName);
        console.log({totalCount})
        totalCount = totalCount.length > 0 && totalCount[0].count || 0
        break;
      case "graduated":
        dataStudent = await getListStudentAdminByStatus(page, pageSize, studentName, "GRADUATED");
        totalCount = await totalCountListStudentAdmin("GRADUATED", studentName);
        break;
      case "dropout":
        dataStudent = await getListStudentAdminByStatus(page, pageSize, studentName, "DROPOUT");
        totalCount = await totalCountListStudentAdmin("DROPOUT", studentName);
        break;
      case "resign":
        dataStudent = await getListStudentAdminByStatus(page, pageSize, studentName, "RESIGN");
        totalCount = await totalCountListStudentAdmin("RESIGN", studentName);
        break;
      default:
        getActiveAcademicYear = await checkAcademicYearThatActive();
        if (!getActiveAcademicYear) return response.res200(res, "001", "Tidak terdapat tahun ajaran yang sedang aktif")

        dataStudent = await getListStudentAdminEnrolled(page, pageSize, studentName, getActiveAcademicYear.id);
        totalCount = await totalCountListStudentAdmin(getActiveAcademicYear.id, studentName);
        break;
    }
    
    const totalPages = Math.ceil(totalCount / pageSize);
    const nextPage = dataStudent.length > pageSize ? page + 1 : null
    // console.log({dataStudent})
    if (dataStudent.length > pageSize) dataStudent.pop();

    const responseData = {
      studentData: [...dataStudent],
      totalData: totalCount,
      totalPages,
      nextPage
    }
    // console.log({totalCount, totalPages})
    return response.res200(res, "000", "Sukses mendapatkan data murid.", responseData)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Data gagal didapatkan. Mohon cek kembali request yang dibuat.")
  }
}
