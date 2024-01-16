"use strict";

const response = require("../../components/response")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Validator = require("fastest-validator");
const v = new Validator();
const { EDIT_PASSWORD, CHANGE_PASSWORD } = require("../../middleware/schema-validator")
const { db, parent } = require("../../components/database");
const { nanoid } = require("nanoid");
const { validationEmail } = require("../../middleware/validator")
const { 
  getParentByUsername,
  getParentProfileById,
  updatePassword,
  getParentById,
  getParentRefreshToken, 
  updateParentRefreshToken,
  getUserEmailByEmail,
  updateForgotPassToken,
  getTokenForgotPass,
  changePassword
} = require("../query/parent")
const { sendEmailUser } = require("../utils/function")
const moment = require("moment")

exports.login = async (req, res, next) => {
  const payload = {
    username: req.body.username,
    password: req.body.password
  }

  if (!payload.username) return response.res400(res, "Username harus diisi.")
  if (!payload.password) return response.res400(res, "Password harus diisi.")
  
  const user = await getParentByUsername(payload.username);
  if (!user) return response.res400(res, "Akun tidak ditemukan.");

  const match = await bcrypt.compare(payload.password, user.password)
  if (!match) return response.res400(res, "Password salah.")

  const userId = user.id
  const name = user.fullname
  const email = user.email
  const username = user.username

  const accessToken = jwt.sign({ userId, name, username }, process.env.ACCESS_TOKEN_SECRET_PARENT, {
    expiresIn: '20s'
  })

  const parentToken = jwt.sign({ userId, name, username }, process.env.REFRESH_TOKEN_SECRET_PARENT, {
    expiresIn: '1d'
  })
  console.log({ parentToken })
  try {
    await updateParentRefreshToken(userId, parentToken)
  } catch (error) {
    console.error(error)
    return response.res400(res, "failed update token")
  }

  res.cookie('parentToken', parentToken, {
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
  return response.res200(res, "000", "Login Berhasil.", { accessToken, parentToken })
}

exports.refreshParentToken = async (req, res, next) => {
  try {
    const parentToken = req.cookies.parentToken;
    if (!parentToken) return response.res401(res)
    console.log({parentToken})
    const user = await getParentRefreshToken(parentToken);
    console.log({user})
    if (!user[0]) return response.res401(res);

    jwt.verify(parentToken, process.env.REFRESH_TOKEN_SECRET_PARENT, (error, decoded) => {
      if (error) return response.res401(res)
      const { id: userId, email, fullname: name } = user[0]
      const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET_PARENT, {
        expiresIn: process.env.REFRESH_TOKEN_DURATION
      })

      return response.res200(res, "000", "Success generate token.", accessToken);
    })
  } catch (error) {
    console.error(error)
  }
}

exports.editPasswordParent = async (req, res, next) => {
  const { user } = req
  const payloadCheck = await v.compile(EDIT_PASSWORD);
  const resPayloadCheck = await payloadCheck(req.body);

  if (resPayloadCheck !== true) {
    return response.res400(res, resPayloadCheck[0].message)
  }
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body

    const userInfo = await getParentById(user.userId);
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
    const userInfo = await getParentById(user.userId);
    if (!userInfo) return response.res400(res, "Akun tidak ditemukan.");

    const profileData = await getParentProfileById(user.userId)
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
        <p>Click this link to continue changing your password: ${process.env.URL_CHANGE_PASSWORD_PARENT}/${forgotPassToken}. Thank you!</p>
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
    const refreshToken = req.cookies.parentToken;
    console.log(refreshToken, req.cookies)
    if (!refreshToken) return response.res200(res, "001", "No content")

    const user = await getParentRefreshToken(refreshToken);
    if (!user[0]) return response.res200(res, "001", "No content")

    const userId = user[0].id

    await updateParentRefreshToken(userId, null)
    
    res.clearCookie('parentToken')
    return response.res200(res, "000", "Berhasil Logout.")
  } catch (error) {
    console.error(error)
  }
}
