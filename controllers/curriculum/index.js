const response = require("../../components/response")
const { db, curriculum } = require("../../components/database");
const moment = require("moment");
const { isString } = require("../../middleware/validator");
const { nanoid } = require("nanoid");
const { getCurriculumActive } = require("../query/curriculum")

exports.insertUpdateCurriculum = async (req, res, next) => {
  const { id, name } = req.body
  if (!name || !isString(name)) return response.res400(res, "Pastikan data yang diinput benar.")

  try {
    const checkCurriculumActive = await getCurriculumActive()
    if (!id) {
      const idCreated = nanoid(36)
      await curriculum.create({
        id: idCreated,
        name,
        status: checkCurriculumActive ? "INACTIVE" : "ACTIVE",
        createdDate: new Date(),
        updatedDate: new Date()
      })
      return response.res200(res, "000", `Sukses memasukkan data kurikulum ${name}`, {id: idCreated, name, status: checkCurriculumActive ? "INACTIVE" : "ACTIVE"})
    }

    await curriculum.update(
      {
        name,
        // status: checkCurriculumActive ? "ACTIVE" : "INACTIVE",
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

exports.activateCurriculum = async (req, res, next) => {
  const { id, isActive } = req.body
  if (!id) return response.res400(res, "Pastikan data yang diinput benar.")
  if (isActive === undefined || isActive === null) return response.res400(res, "Pastikan data yang diinput benar.")

  try {
    await curriculum.update(
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
    return response.res200(res, "000", `Sukses mengubah data kurikulum`)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal. Mohon cek kembali data yang dibuat.")
  }
}

exports.getAllCurriculum = async (req, res, next) => {
  const getAllCurriculumData = await curriculum.findAll({
    raw: true,
    attributes: ["id", "name", "status"]
  })
  return response.res200(res, "000", "success get all curriculum data.", getAllCurriculumData || []);
}
