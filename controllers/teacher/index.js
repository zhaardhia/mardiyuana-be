"use strict";

const response = require("../../components/response")
const { db, teacher } = require("../../components/database");
const { nanoid } = require("nanoid");
const { validationEmail } = require("../../middleware/validator")
const { GET_LIST_TEACHER_TABLE_ADMIN } = require("../../middleware/schema-validator")
const Validator = require("fastest-validator");
const v = new Validator();
const { 
  getListTeacherAdminByStatus,
  totalCountListTeacherAdminByStatus,
  getDetailTeacherAdmin
} = require("../query/teacher")
const {
  getAllEnrollAcademicTeacher
} = require("../query/enrollmentTeacher")
const {
  checkAcademicYearThatActive
} = require("../query/academicYear")

exports.editTeacher = async (req, res, next) => {
  const { id, username, fullname, name, email, phone, bornIn, bornAt } = req.body

  if (!id) return response.res400(res, "Username wajib diisi.")
  if (!username) return response.res400(res, "Username wajib diisi.")
  if (!email) return response.res400(res, "Email wajib diisi.")
  if (!fullname) return response.res400(res, "Email wajib diisi.")
  if (!name) return response.res400(res, "Email wajib diisi.")
  if (!validationEmail(email)) return response.res400(res, "Email harus valid.")
  if (!phone) return response.res400(res, "Nomor telepon / whatsapp wajib diisi.")
  if (!bornIn) return response.res400(res, "Password wajib diisi.")
  if (!bornAt) return response.res400(res, "Password wajib diisi.")

  const checkEmail = await teacher.findOne({
    raw:true,
    where: {
      email
    }
  });
  if (!checkEmail) return response.res400(res, "Email belum terdaftar");

  const checkUsername = await teacher.findOne({
    raw:true,
    where: {
      username
    }
  });
  if (!checkUsername) return response.res400(res, "Username belum terdaftar")

  try {
    const teacherId = id
    delete req.body.id

    const payload = {
      ...req.body,
      updatedDate: new Date()
    }
    await teacher.update(payload, { where: { id: teacherId } });

    return response.res200(res, "000", "Sukses mengubah akun orang tua murid beserta muridnya.")
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Update Gagal. Mohon cek kembali data orang tua atau murid yang dibuat.")
  }
}

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

exports.getDetailTeacherAdmin = async (req, res, next) => {
  const { id } = req.query
  if (!id) return response.res400(res, "id is required.")

  try {
    const detailStudent = await getDetailTeacherAdmin(id)
    if (!detailStudent) return response.res200(res, "001", "Data guru tidak tersedia")
    console.log({detailStudent})

    const checkAcademicYearActive = await checkAcademicYearThatActive()
    const allEnrollAcademicYear = await getAllEnrollAcademicTeacher()
    let setOfAcademicYear = []

    if (allEnrollAcademicYear.length > 0) {
      const academicYearSet = new Set();
      allEnrollAcademicYear.forEach(item => {
        if (!academicYearSet.has(item.academicYearId)) {
          
          academicYearSet.add(item.academicYearId);
          setOfAcademicYear.push({ ...item, status: item.academicYearId === checkAcademicYearActive.id ? "ACTIVE" : "INACTIVE" });
        }
      });
      // setOfAcademicYear = [...new Set(allEnrollAcademicYear.map(item => item.academicYear))];
    }
    console.log({setOfAcademicYear})
    return response.res200(res, "000", "Sukses mendapatkan detail data guru", { ...detailStudent, enrolledAcademicYears: setOfAcademicYear })
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Data gagal didapatkan. Mohon cek kembali request yang dibuat.")
  }
}
