"use strict";

const response = require("../../components/response")
const { db, parent } = require("../../components/database");
const { nanoid } = require("nanoid");
const { validationEmail } = require("../../middleware/validator")
const { GET_LIST_TEACHER_TABLE_ADMIN } = require("../../middleware/schema-validator")
const Validator = require("fastest-validator");
const v = new Validator();
const { 
  getListTeacherAdminByStatus,
  totalCountListTeacherAdminByStatus
} = require("../query/teacher")

exports.listTableStudentAdmin = async (req, res, next) => {
  const payload = {
    page: Number(req.query.page) || undefined,
    pageSize: Number(req.query.pageSize) || undefined,
    teacherName: req.query.teacherName || '',
    filterBy: req.query.filterBy || '',
  }
  const payloadCheck = await v.compile(GET_LIST_TEACHER_TABLE_ADMIN);
  const resPayloadCheck = await payloadCheck(payload);

  if (resPayloadCheck !== true) {
    return response.res400(res, "Mohon cek kembali kelengkapan data yang telah dikirim.")
  }
  if (payload.filterBy && !["active", "inactive"].includes(payload.filterBy)) return response.res400(res, "Mohon cek kembali kelengkapan data yang telah dikirim.")

  const filtering = {
    active: "ACTIVE",
    inactive: "INACTIVE"
  }
  
  const { page, pageSize, teacherName, filterBy } = payload

  try {
    let dataTeacher = null;
    let totalCount = null;

    dataTeacher = await getListTeacherAdminByStatus(page, pageSize, teacherName, filtering[filterBy]);
    totalCount = await totalCountListTeacherAdminByStatus(filtering[filterBy], teacherName);
    
    const totalPages = Math.ceil(totalCount / pageSize);
    const nextPage = dataTeacher.length > pageSize ? page + 1 : null
    // console.log({dataTeacher})
    if (dataTeacher.length > pageSize) dataTeacher.pop();

    const responseData = {
      teacherData: [...dataTeacher],
      totalData: totalCount,
      totalPages,
      nextPage
    }
    // console.log({totalCount, totalPages})
    return response.res200(res, "000", "Sukses mendapatkan data guru.", responseData)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Data gagal didapatkan. Mohon cek kembali request yang dibuat.")
  }
}
