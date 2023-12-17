"use strict";

const response = require("../../components/response")
const { db, admin } = require("../../components/database");
// const bcrypt = require("bcrypt")
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken")
const { validationEmail } = require("../../middleware/validator")
// const { forgotPass } = require("../../libs/email")
const bcrypt = require("bcryptjs")

exports.registerAdmin = async (req, res, next) => {
  const { email, username, phone, fullname, password, confPassword } = req.body

  if (!username) return response.res400(res, "Username wajib diisi.")
  if (!email) return response.res400(res, "Email wajib diisi.")
  if (!fullname) return response.res400(res, "Email wajib diisi.")
  if (!validationEmail(email)) return response.res400(res, "Email harus valid.")
  if (!phone) return response.res400(res, "Nomor telepon / whatsapp wajib diisi.")
  if (!password) return response.res400(res, "Password wajib diisi.")
  if (password.length < 6) return response.res400(res, "Password harus berisi 6 karakter atau lebih.")
  if (password !== confPassword) return response.res400(res, "Konfirmasi Password tidak cocok.")

  const checkEmail = await admin.findOne({
    raw:true,
    where: {
      email
    }
  });
  if (checkEmail) return response.res400(res, "Email sudah terdaftar");

  const checkUsername = await admin.findOne({
    raw:true,
    where: {
      username
    }
  });
  if (checkUsername) return response.res400(res, "Username sudah terdaftar")

  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);

  const payload = {
    id: nanoid(36),
    email,
    username,
    phone,
    fullname, 
    password: hashPassword,
    createdDate: new Date(),
    updatedDate: new Date()
  }
  console.log(payload)
  try {
    await admin.create(payload);
    return response.res200(res, "000", "Register Admin Berhasil.")
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Register Gagal. Mohon cek kembali data user yang dibuat.")
  }
}
