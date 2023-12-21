const response = require("../../components/response")
const { db, course, curriculum } = require("../../components/database");
const moment = require("moment");
const { isString } = require("../../middleware/validator");
const { nanoid } = require("nanoid");
const { getCurriculumDetail } = require("../query/curriculum")

exports.insertUpdateCourse = async (req, res, next) => {
  const { id, name, curriculumId } = req.body
  if (!name || !isString(name)) return response.res400(res, "Pastikan data yang diinput benar.")
  if (!curriculumId || !isString(curriculumId)) return response.res400(res, "Pastikan data yang diinput benar.")

  try {
    const checkCurriculum = await getCurriculumDetail(curriculumId)
    if (!checkCurriculum || checkCurriculum.status !== "ACTIVE") return response.res200(res, "001", "Kurikulum tidak terdaftar.")

    if (!id) {
      await course.create({
        id: nanoid(36),
        name,
        curriculumId: curriculumId,
        curriculumName: checkCurriculum.name,
        createdDate: new Date(),
        updatedDate: new Date()
      })
      return response.res200(res, "000", `Sukses memasukkan data pelajaran ${name}`)
    }

    await course.update(
      {
        name,
        curriculumId: curriculumId,
        curriculumName: checkCurriculum.name,
        updatedDate: new Date()
      },
      {
        where: {
          id
        }
      }
    )
    return response.res200(res, "000", `Sukses mengubah data pelajaran ${name}`)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal. Mohon cek kembali data yang dibuat.")
  }
}
