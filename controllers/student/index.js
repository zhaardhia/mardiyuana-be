"use strict";

const response = require("../../components/response")
const { db, student, parent, enrollment_student } = require("../../components/database");
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken")
const { validationEmail } = require("../../middleware/validator")
const { GET_LIST_STUDENT_TABLE_ADMIN, EDIT_PASSWORD, CHANGE_PASSWORD } = require("../../middleware/schema-validator")
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
  getStudentByUsername,
  getStudentById,
  getStudentProfileById,
  updatePassword,
  getUserEmailByEmail,
  updateForgotPassToken,
  getTokenForgotPass,
  changePassword
} = require("../query/student")
const { 
  checkAcademicYearThatActive
} = require("../query/academicYear")
const { validatePayloadCreateStudentParent } = require("../admin/utils")
const bcrypt = require("bcryptjs")
const moment = require("moment")
const { sendEmailUser } = require("../utils/function")

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
    console.log({payloadStudent})
    if (payloadStudent.name) {
      await enrollment_student.update(
        {
          studentName: payloadStudent.fullname
        },
        {
          where: {
            studentId: payloadStudent.id
          }
        }
      )
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
            // ["id", "fullname", "name", "email", "username", "createdDate", "bornIn", "bornAt", "phone"]
            return {
              id: data.id,
              fullname: data.fullname,
              name: data.name,
              email: data.email,
              username: data.username,
              createdDate: data.createdDate,
              bornIn: data.bornIn,
              bornAt: data.bornAt,
              parent: {
                id: data.parentId,
                fullname: data.parentFullname,
                name: data.parentName,
                email: data.parentEmail,
                username: data.parentUsername,
                createdDate: data.parentCreatedDate,
                bornIn: data.parentBornIn,
                bornAt: data.parentBornAt,
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
    console.log({dataStudent})
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

  const studentToken = jwt.sign({ userId, name, username }, process.env.REFRESH_TOKEN_SECRET_STUDENT, {
    expiresIn: '1d'
  })
  console.log({ studentToken })
  try {
    await updateStudentRefreshToken(userId, studentToken)
  } catch (error) {
    console.error(error)
    return response.res400(res, "failed update token")
  }

  res.cookie('studentToken', studentToken, {
    // httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    // domain: 'https://mertapada-investor-frontend2.vercel.app',
    // secure: true, // Use for HTTPS only
    // httpOnly: true, // Ensure the cookie is not accessible via JavaScript
    // sameSite: 'lax'
    // secure: true,
    // domain: "localhost",
    // path: "/",
    // sameSite: "None"
  })
  return response.res200(res, "000", "Login Berhasil.", { accessToken, studentToken })
}

exports.refreshStudentToken = async (req, res, next) => {
  try {
    const studentToken = req.cookies.studentToken;
    if (!studentToken) return response.res401(res)
    console.log({studentToken})
    const user = await getStudentRefreshToken(studentToken);
    if (!user[0]) return response.res401(res);

    jwt.verify(studentToken, process.env.REFRESH_TOKEN_SECRET_STUDENT, (error, decoded) => {
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

exports.editPasswordStudent = async (req, res, next) => {
  const { user } = req
  const payloadCheck = await v.compile(EDIT_PASSWORD);
  const resPayloadCheck = await payloadCheck(req.body);

  if (resPayloadCheck !== true) {
    return response.res400(res, resPayloadCheck[0].message)
  }
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body

    const userInfo = await getStudentById(user.userId);
    if (!userInfo) return response.res400(res, "Akun tidak ditemukan.");

    const match = await bcrypt.compare(oldPassword, userInfo.password)
    if (!match) return response.res400(res, "Password lama salah.")

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(newPassword, salt);

    await updatePassword(user.userId, hashPassword)

    return response.res200(res, "000", "Sukses ganti password.")
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Gagal ganti password.")
  }
}

exports.getProfileData = async (req, res, next) => {
  try {
    const { user } = req
    const userInfo = await getStudentById(user.userId);
    if (!userInfo) return response.res400(res, "Akun tidak ditemukan.");

    const profileData = await getStudentProfileById(user.userId)
    return response.res200(res, "000", "Berhasil mendapatkan data profile.", profileData)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Gagal mendapatkan data profile.")
  }
}

exports.sendEmailAddressForgotPass = async (req, res, next) => {
  if (!req.body.email) return response.res400(res, "email is required.")
  if (!validationEmail(req.body.email)) return response.res400(res, "input Email must be valid format.")

  const checkEmail = await getUserEmailByEmail({ email: req.body.email });
  if (!checkEmail) return response.res400(res, "email is not registered.")

  const forgotPassToken = nanoid(10)
  try {
    const forgotPassTokenExpired = moment().add(1, 'hour');
    await updateForgotPassToken({ 
      userId: checkEmail.id,
      forgotPasswordToken: forgotPassToken,
      forgotPasswordTokenExpiredAt: forgotPassTokenExpired 
    })

    const options = {
      from: "'SMP Mardiyuana' <firzharamadhan27@gmail.com>",
      to: checkEmail.email,
      subject: "Change Password Account",
      html: `
        <p>Click this link to continue changing your password: ${process.env.URL_CHANGE_PASSWORD_STUDENT}/${forgotPassToken}. Thank you!</p>
      `
    };
    sendEmailUser(options)
    return response.res200(res, "000", "access change password already sent to your email.")
  } catch (error) {
    console.error(error)
    return response.res400(res, error.message)
  }
}

exports.changePasswordForgotPass = async (req, res, next) => {
  const payloadCheck = await v.compile(CHANGE_PASSWORD);
  const resPayloadCheck = await payloadCheck(req.body);
  if (resPayloadCheck !== true) {
    return response.res400(res, resPayloadCheck[0].message)
  }

  const { forgotPassToken, password } = req.body;
  const checkToken = await getTokenForgotPass({ forgotPasswordToken: forgotPassToken })
  if (!checkToken || moment().isAfter(moment(checkToken.forgotPasswordTokenExpiredAt))) return response.res400(res, "failed to change password. please request link again")

  try {
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    
    await changePassword({ id: checkToken.id, password: hashPassword })
    return response.res200(res, "000", "password has been changed successfully")
  } catch (error) {
    console.error(error)
    return response.res400(res, error.message)
  }
}

exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.studentToken;
    console.log(refreshToken, req.cookies)
    if (!refreshToken) return response.res200(res, "001", "No content")

    const user = await getStudentRefreshToken(refreshToken);
    if (!user[0]) return response.res200(res, "001", "No content")

    const userId = user[0].id

    await updateStudentRefreshToken(userId, null)
    
    res.clearCookie('studentToken')
    return response.res200(res, "000", "Berhasil Logout.")
  } catch (error) {
    console.error(error)
  }
}
