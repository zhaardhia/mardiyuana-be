const response = require("../../components/response")
const { db, curriculum } = require("../../components/database");
const moment = require("moment");
const { isString } = require("../../middleware/validator");
const { nanoid } = require("nanoid");

exports.insertUpdateCurriculum = async (req, res, next) => {
  const { id, name, isActive } = req.body
  if (!name || !isString(name)) return response.res400(res, "Pastikan data yang diinput benar.")
  if (!isActive) return response.res400(res, "Pastikan data yang diinput benar.")

  try {
    
    if (!id) {
      await curriculum.create({
        id: nanoid(36),
        name,
        status: isActive ? "ACTIVE" : "INACTIVE",
        createdDate: new Date(),
        updatedDate: new Date()
      })
      return response.res200(res, "000", `Sukses memasukkan data kurikulum ${name}`)
    }

    await curriculum.update(
      {
        name,
        status: isActive ? "ACTIVE" : "INACTIVE",
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
    raw: true
  })
  return response.res200(res, "000", "success get all curriculum data.", getAllCurriculumData);
}