const response = require("../../components/response")
const { db, academic_year } = require("../../components/database");
const moment = require("moment");
const { isString } = require("../../middleware/validator");
const { nanoid } = require("nanoid");
const { checkAcademicYearThatActive, checkAcademicYearIsRegistered } = require("../query/academicYear")
const { getCurriculumActive } = require("../query/curriculum")

exports.insertUpdateAcademicYear = async (req, res, next) => {
  const { id, academicYear } = req.body
  if (!academicYear || !isString(academicYear)) return response.res400(res, "Pastikan data yang diinput benar.")

  try {
    const checkActiveAcademicYear = await checkAcademicYearThatActive()
    const getCurriculum = await getCurriculumActive()
    if (!id) {
      const idCreated = nanoid(36)
      await academicYear.create({
        id: idCreated,
        academicYear,
        curriculumId: getCurriculum.id,
        curriculumName: getCurriculum.name,
        status: checkActiveAcademicYear ? "INACTIVE" : "ACTIVE",
        createdDate: new Date(),
        updatedDate: new Date()
      })
      return response.res200(res, "000", `Sukses memasukkan data tahun ajaran ${academicYear}`, {id: idCreated, academicYear, status: checkActiveAcademicYear ? "INACTIVE" : "ACTIVE"})
    }

    await academicYear.update(
      {
        academicYear,
        updatedDate: new Date()
      },
      {
        where: {
          id
        }
      }
    )
    return response.res200(res, "000", `Sukses mengubah data tahun ajaran ${academicYear}`)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal. Mohon cek kembali data yang dibuat.")
  }
}

exports.activateAcademicYear = async (req, res, next) => {
  const { id, isActive } = req.body
  if (!id) return response.res400(res, "Pastikan data yang diinput benar.")
  if (isActive === undefined || isActive === null) return response.res400(res, "Pastikan data yang diinput benar.")

  try {
    await academic_year.update(
      {
        status: isActive ? "ACTIVE" : "INACTIVE",
        updatedDate: new Date()
      },
      {
        where: {
          id
        }
      }
    )
    return response.res200(res, "000", `Sukses mengubah data tahun ajaran`)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal. Mohon cek kembali data yang dibuat.")
  }
}

exports.getAllAcademicYear = async (req, res, next) => {
  const getAllAcademicYearData = await academic_year.findAll({
    raw: true,
    attributes: ["id", "academicYear", "status", "curriculumId", "curriculumName"]
  })
  return response.res200(res, "000", "success get all academic year data.", getAllAcademicYearData || []);
}

exports.deleteAcademicYear = async (req, res, next) => {
  const { id } = req.body
  if (!id) return response.res400(res, "id is required.")

  try {
    await academic_year.destroy({
      where: { id }
    })

    return response.res200(res, "000", "Sukses menghapus tahun ajaran.")
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}
