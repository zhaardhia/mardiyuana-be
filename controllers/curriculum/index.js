const response = require("../../components/response")
const { db, curriculum } = require("../../components/database");
const { 
  checkEnrollmentStudentIsRegistered,
  insertEnrollmentStudent,
  updateClassOrAcademicYearEnrollmentStudent
} = require("../query/enrollmentStudent")
const { 
  checkSchoolClassStatus,
} = require("../query/schoolClass")
const { 
  checkAcademicYearIsRegistered,
} = require("../query/academicYear")
const moment = require("moment");
const { isString } = require("../../middleware/validator");
const { nanoid } = require("nanoid");

exports.insertUpdateCurriculum = async (req, res, next) => {
  const { id, name } = req.body
  if (!name || !isString(name)) return response.res400(res, "Pastikan data yang diinput benar.")

  try {
    
    if (!id) {
      await curriculum.create({
        id: nanoid(36),
        name,
        createdDate: new Date(),
        updatedDate: new Date()
      })
      return response.res200(res, "000", `Sukses memasukkan data kurikulum ${name}`)
    }

    await curriculum.update(
      {
        name,
        updatedDate: new Date()
      },
      {
        where: {
          id
        }
      }
    )
    return response.res200(res, "000", `Sukses mengubah data kurikulum ${name}`)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal. Mohon cek kembali data yang dibuat.")
  }
}

exports.getAllCurriculum = async (req, res, next) => {
  const getAllCurriculumData = await curriculum.findAll({
    raw: true
  })
  return response.res200(res, "000", "success get all curriculum data.", getAllCurriculumData);
}