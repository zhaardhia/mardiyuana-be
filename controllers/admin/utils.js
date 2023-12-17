const response = require("../../components/response")
const { db, parent, student } = require("../../components/database");
const { validationEmail, isString } = require("../../middleware/validator")

const roleObj = {
  parent: "orang tua",
  student: "murid"
}

exports.validatePayloadCreateStudentParent = async (res, payload, role) => {
  const { 
    username, fullname, name, email, bornIn, bornAt, startAcademicYear
  } = payload
  console.log({role})
  // check username
  if (!username || !isString(username) || username.length < 3) return response.res400(res, `Username ${roleObj[role]} wajib diisi.`)

  let checkUsername = null
  if (role === "student") {
    checkUsername = await student.findOne({
      raw:true,
      where: {
        username
      }
    });
  } else if (role === "parent") {
    checkUsername = await parent.findOne({
      raw:true,
      where: {
        username
      }
    });
  }
  if (checkUsername) return response.res400(res, `Email ${roleObj[role]} sudah terdaftar`);


  // check fullname
  if (!fullname || !isString(fullname) || fullname.length < 3) return response.res400(res, `Nama lengkap ${roleObj[role]} wajib diisi.`)
  // check name
  if (!name || !isString(name) || name.length < 3) return response.res400(res, `Nama ${roleObj[role]} wajib diisi.`)

  // check email
  if (!email || !isString(email) || name.length < 3 || !validationEmail(email)) return response.res400(res, `Email ${roleObj[role]} wajib diisi dengan format email yang benar`)

  let checkEmail = null
  if (role === "student") {
    checkEmail = await student.findOne({
      raw:true,
      where: {
        email
      }
    });
  } else if (role === "parent") {
    checkEmail = await parent.findOne({
      raw:true,
      where: {
        email
      }
    });
  }
  if (checkEmail) return response.res400(res, `Email ${roleObj[role]} sudah terdaftar`);

  // check bornIn
  if (!bornIn || !isString(bornIn) || bornIn.length < 3) return response.res400(res, `Tempat lahir ${roleObj[role]} wajib diisi.`)
  // check name
  if (!bornAt) return response.res400(res, `Tanggal lahir ${roleObj[role]} wajib diisi.`)
  // check startAcademicYear  // make sure tahun ajaran diinput dari frontend apa backend
  // if (!startAcademicYear) return response.res400(res, `Tanggal lahir ${roleObj[role]} wajib diisi.`)

  return true
}
