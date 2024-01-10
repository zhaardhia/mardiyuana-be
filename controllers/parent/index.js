"use strict";

const response = require("../../components/response")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { db, parent } = require("../../components/database");
const { nanoid } = require("nanoid");
const { validationEmail } = require("../../middleware/validator")
const { getParentByUsername, getParentRefreshToken, updateParentRefreshToken } = require("../query/parent")
// const { forgotPass } = require("../../libs/email")

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

  const refreshToken = jwt.sign({ userId, name, username }, process.env.REFRESH_TOKEN_SECRET_PARENT, {
    expiresIn: '1d'
  })
  console.log({ refreshToken })
  try {
    await updateParentRefreshToken(userId, refreshToken)
  } catch (error) {
    console.error(error)
    return response.res400(res, "failed update token")
  }

  res.cookie('refreshToken', refreshToken, {
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
  return response.res200(res, "000", "Login Berhasil.", { accessToken, refreshToken })
}

exports.refreshParentToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return response.res401(res)
    console.log({refreshToken})
    const user = await getParentRefreshToken(refreshToken);
    if (!user[0]) return response.res401(res);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_PARENT, (error, decoded) => {
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
