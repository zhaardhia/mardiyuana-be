"use strict";

const response = require("../../components/response")
const { db, admin, parent, student, teacher } = require("../../components/database");
// const bcrypt = require("bcrypt")
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken")
const { validationEmail } = require("../../middleware/validator")
const { validatePayloadCreateStudentParent } = require("./utils")
const bcrypt = require("bcryptjs")
const moment = require("moment")

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

exports.registerParent = async (req, res, next) => {
  const { parent: parentPayload, student: studentPayload } = req.body
  const dbTransaction = await db.transaction();

  if (!parentPayload) return response.res400(res, "parent object is empty.")
  if (!studentPayload) return response.res400(res, "student object is empty.")

  const checkParent = await validatePayloadCreateStudentParent(res, parentPayload, "parent")
  if (!checkParent) return checkParent;
  console.log({checkParent})
  const checkStudent = await validatePayloadCreateStudentParent(res, studentPayload, "student")
  if (!checkStudent) return checkStudent;

  try {
    // username, fullname, name, email, phone, status, bornIn, bornAt, startAcademicYear
    const parentId = nanoid(36);
    const studentId = nanoid(36);

    // format default password = username + email + bornAt (YYYY-MM-DD)
    const parentPassword = `${parentPayload.username}${parentPayload.email}${String(parentPayload.bornAt)}`
    const studentPassword = `${studentPayload.username}${studentPayload.email}${String(studentPayload.bornAt)}`

    const saltParent = await bcrypt.genSalt();
    const hashPasswordParent = await bcrypt.hash(parentPassword, saltParent);

    const saltStudent = await bcrypt.genSalt();
    const hashPasswordStudent = await bcrypt.hash(studentPassword, saltStudent);

    const payloadParent = {
      transaction: dbTransaction,
      id: parentId,
      ...parentPayload,
      status: 'ACTIVE',
      password: hashPasswordParent,
      studentId,
      createdDate: new Date(),
      updatedDate: new Date()
    }

    const payloadStudent = {
      transaction: dbTransaction,
      id: studentId,
      ...studentPayload,
      status: 'ACTIVE',
      password: hashPasswordStudent,
      parentId,
      createdDate: new Date(),
      updatedDate: new Date()
    }

    await parent.create(payloadParent);
    await student.create(payloadStudent);

    await dbTransaction.commit()
    return response.res200(res, "000", "Sukses membuat akun orang tua murid beserta muridnya.")
  } catch (error) {
    console.error(error)
    await dbTransaction.rollback()
    return response.res200(res, "001", "Register Gagal. Mohon cek kembali data orang tua atau murid yang dibuat.")
  }
}

exports.registerTeacher = async (req, res, next) => {
  const { username, fullname, name, email, phone, bornIn, bornAt } = req.body

  if (!username) return response.res400(res, "Username wajib diisi.")
  if (!email) return response.res400(res, "Email wajib diisi.")
  if (!fullname) return response.res400(res, "Email wajib diisi.")
  if (!name) return response.res400(res, "Email wajib diisi.")
  if (!validationEmail(email)) return response.res400(res, "Email harus valid.")
  if (!phone) return response.res400(res, "Nomor telepon / whatsapp wajib diisi.")
  if (!bornIn) return response.res400(res, "Password wajib diisi.")
  if (!bornAt) return response.res400(res, "Password wajib diisi.")

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

  const password = `${username}${email}${String(bornAt)}`
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);

  const payload = {
    id: nanoid(36),
    email,
    username,
    phone,
    fullname, 
    name,
    bornAt,
    bornIn,
    status: "ACTIVE",
    startAt: new Date(),
    password: hashPassword,
    createdDate: new Date(),
    updatedDate: new Date()
  }
  console.log(payload)
  try {
    await teacher.create(payload);
    return response.res200(res, "000", "Register Guru Berhasil.")
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Register Gagal. Mohon cek kembali data guru yang dibuat.")
  }
}
