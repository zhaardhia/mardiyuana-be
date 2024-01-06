"use strict";

const response = require("../../components/response")
const { db, student, parent } = require("../../components/database");
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
  totalCountListStudentAdminByStatus,
  getDetailStudentAdminEnrolled,
  updateStudentRefreshToken,
  getStudentRefreshToken,
  getStudentByUsername
} = require("../query/student")
const { 
  checkAcademicYearThatActive
} = require("../query/academicYear")
const { validatePayloadCreateStudentParent } = require("../admin/utils")
const bcrypt = require("bcryptjs")

exports.editStudentAndParent = async (req, res, next) => {
  const { parent: parentPayload, student: studentPayload } = req.body

  if (!parentPayload) return response.res400(res, "parent object is empty.")
  if (!studentPayload) return response.res400(res, "student object is empty.")
  if (!parentPayload.id) return response.res400(res, "parent id is empty.")
  if (!studentPayload.id) return response.res400(res, "student id is empty.")

  const checkParent = await validatePayloadCreateStudentParent(res, parentPayload, "parent", true)
  if (!checkParent) return checkParent;
  console.log({checkParent})
  const checkStudent = await validatePayloadCreateStudentParent(res, studentPayload, "student", true)
  if (!checkStudent) return checkStudent;

  try {
    // username, fullname, name, email, phone, status, bornIn, bornAt, startAcademicYear

    const payloadParent = {
      ...parentPayload,
      updatedDate: new Date()
    }

    const payloadStudent = {
      ...studentPayload,
      updatedDate: new Date()
    }
    console.log({payloadParent, payloadStudent})
    await parent.update(payloadParent, { where: { id: parentPayload.id } });
    await student.update(payloadStudent, { where: { id: studentPayload.id } });

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

exports.getDetailStudentAdmin = async (req, res, next) => {
  const { id } = req.query
  if (!id) return response.res400(res, "id is required.")

  try {
    const detailStudent = await getDetailStudentAdminEnrolled(id)
    if (!detailStudent) return response.res200(res, "001", "Data murid tidak tersedia")
    console.log({detailStudent})
    return response.res200(res, "000", "Sukses mendapatkan detail data murid", detailStudent)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Data gagal didapatkan. Mohon cek kembali request yang dibuat.")
  }
}


// Student Side

exports.login = async (req, res, next) => {
  const payload = {
    username: req.body.username,
    password: req.body.password
  }

  if (!payload.username) return response.res400(res, "Username harus diisi.")
  if (!payload.password) return response.res400(res, "Password harus diisi.")
  
  const user = await getStudentByUsername(payload.username);
  if (!user) return response.res400(res, "Akun tidak ditemukan.");

  const match = await bcrypt.compare(payload.password, user.password)
  if (!match) return response.res400(res, "Password salah.")

  const userId = user.id
  const name = user.fullname
  const email = user.email
  const username = user.username

  const accessToken = jwt.sign({ userId, name, username }, process.env.ACCESS_TOKEN_SECRET_STUDENT, {
    expiresIn: '20s'
  })

  const refreshToken = jwt.sign({ userId, name, username }, process.env.REFRESH_TOKEN_SECRET_STUDENT, {
    expiresIn: '1d'
  })
  console.log({ refreshToken })
  try {
    await updateStudentRefreshToken(userId, refreshToken)
  } catch (error) {
    console.error(error)
    return response.res400(res, "failed update token")
  }

  res.cookie('refreshToken', refreshToken, {
    // httpOnly: true,
    maxAge: 24 * 60 * 60 * 10,
    // domain: 'https://mertapada-investor-frontend2.vercel.app',
    // secure: true, // Use for HTTPS only
    // httpOnly: true, // Ensure the cookie is not accessible via JavaScript
    // sameSite: 'lax'
    // secure: true,
    // domain: "localhost",
    // path: "/",
    // sameSite: "None"
  })
  return response.res200(res, "000", "Login Berhasil.", { accessToken, refreshToken })
}

exports.refreshStudentToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return response.res401(res)
    console.log({refreshToken})
    const user = await getStudentRefreshToken(refreshToken);
    if (!user[0]) return response.res401(res);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_STUDENT, (error, decoded) => {
      if (error) return response.res401(res)
      const { id: userId, email, fullname: name } = user[0]
      const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET_STUDENT, {
        expiresIn: process.env.REFRESH_TOKEN_DURATION
      })

      return response.res200(res, "000", "Success generate token.", accessToken);
    })
  } catch (error) {
    console.error(error)
  }
}
