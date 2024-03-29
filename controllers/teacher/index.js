"use strict";

const response = require("../../components/response")
const { db, teacher } = require("../../components/database");
const { nanoid } = require("nanoid");
const { validationEmail } = require("../../middleware/validator")
const { GET_LIST_TEACHER_TABLE_ADMIN, EDIT_PASSWORD, CHANGE_PASSWORD } = require("../../middleware/schema-validator")
const Validator = require("fastest-validator");
const v = new Validator();
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { 
  getListTeacherAdminByStatus,
  totalCountListTeacherAdminByStatus,
  getDetailTeacherAdmin,
  getTeacherByUsername,
  updateTeacherRefreshToken,
  getTeacherRefreshToken,
  updatePassword,
  getTeacherById,
  getTeacherProfileById,
  getUserEmailByEmail,
  updateForgotPassToken,
  getTokenForgotPass,
  changePassword
} = require("../query/teacher")
const {
  getAllEnrollAcademicTeacher
} = require("../query/enrollmentTeacher")
const {
  checkAcademicYearThatActive
} = require("../query/academicYear")
const { sendEmailUser } = require("../utils/function")
const moment = require("moment")

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


exports.login = async (req, res, next) => {
  const payload = {
    username: req.body.username,
    password: req.body.password
  }

  if (!payload.username) return response.res400(res, "Username harus diisi.")
  if (!payload.password) return response.res400(res, "Password harus diisi.")
  
  const user = await getTeacherByUsername(payload.username);
  if (!user) return response.res400(res, "Akun tidak ditemukan.");

  const match = await bcrypt.compare(payload.password, user.password)
  if (!match) return response.res400(res, "Password salah.")

  const userId = user.id
  const name = user.fullname
  const email = user.email
  const username = user.username

  const accessToken = jwt.sign({ userId, name, username }, process.env.ACCESS_TOKEN_SECRET_TEACHER, {
    expiresIn: '20s'
  })

  const teacherToken = jwt.sign({ userId, name, username }, process.env.REFRESH_TOKEN_SECRET_TEACHER, {
    expiresIn: '1d'
  })
  console.log({ teacherToken })
  try {
    await updateTeacherRefreshToken(userId, teacherToken)
  } catch (error) {
    console.error(error)
    return response.res400(res, "failed update token")
  }

  res.cookie('teacherToken', teacherToken, {
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
  return response.res200(res, "000", "Login Berhasil.", { accessToken, teacherToken })
}

exports.refreshTeacherToken = async (req, res, next) => {
  try {
    const teacherToken = req.cookies.teacherToken;

    if (!teacherToken) return response.res401(res)
    console.log({teacherToken})
    const user = await getTeacherRefreshToken(teacherToken);
    console.log({user})
    if (!user[0]) return response.res401(res);

    jwt.verify(teacherToken, process.env.REFRESH_TOKEN_SECRET_TEACHER, (error, decoded) => {
      if (error) return response.res401(res)
      const { id: userId, email, fullname: name } = user[0]
      const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET_TEACHER, {
        expiresIn: process.env.REFRESH_TOKEN_DURATION
      })

      return response.res200(res, "000", "Success generate token.", accessToken);
    })
  } catch (error) {
    console.error(error)
  }
}

exports.editPasswordTeacher = async (req, res, next) => {
  const { user } = req
  const payloadCheck = await v.compile(EDIT_PASSWORD);
  const resPayloadCheck = await payloadCheck(req.body);

  if (resPayloadCheck !== true) {
    return response.res400(res, resPayloadCheck[0].message)
  }
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body

    const userInfo = await getTeacherById(user.userId);
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
    const userInfo = await getTeacherProfileById(user.userId);
    if (!userInfo) return response.res400(res, "Akun tidak ditemukan.");

    const profileData = await getTeacherProfileById(user.userId)
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
        <p>Click this link to continue changing your password: ${process.env.URL_CHANGE_PASSWORD_TEACHER}/${forgotPassToken}. Thank you!</p>
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
    const refreshToken = req.cookies.teacherToken;
    console.log(refreshToken, req.cookies)
    if (!refreshToken) return response.res200(res, "001", "No content")

    const user = await getTeacherRefreshToken(refreshToken);
    if (!user[0]) return response.res200(res, "001", "No content")

    const userId = user[0].id

    await updateTeacherRefreshToken(userId, null)
    
    res.clearCookie('teacherToken')
    return response.res200(res, "000", "Berhasil Logout.")
  } catch (error) {
    console.error(error)
  }
}
