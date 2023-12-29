const response = require("../../components/response")
const { db, course, curriculum } = require("../../components/database");
const moment = require("moment");
const { isString } = require("../../middleware/validator");
const { nanoid } = require("nanoid");
const { getCurriculumDetail, getCurriculumActive } = require("../query/curriculum")
const { courseConstant } = require("../utils/data")
const { checkCourseStatus, getAllCourse } = require("../query/course")

exports.insertUpdateCourse = async (req, res, next) => {
  const { id, courseIdentifier, grade, curriculumId } = req.body
  if (!courseIdentifier || !isString(courseIdentifier)) return response.res400(res, "Pastikan data yang diinput benar.")
  if (!grade) return response.res400(res, "Pastikan data yang diinput benar.")
  if (!curriculumId || !isString(curriculumId)) return response.res400(res, "Pastikan data yang diinput benar.")
  const name = courseConstant.find(courseData => courseData.value === courseIdentifier).label

  try {
    const checkCurriculum = await getCurriculumDetail(curriculumId)
    if (!checkCurriculum || checkCurriculum.status !== "ACTIVE") return response.res200(res, "001", "Kurikulum tidak terdaftar.")

    if (!id) {
      const checkRegisteredCourse = await checkCourseStatus(courseIdentifier, grade)
      if (checkRegisteredCourse) return response.res200(res, "001", "Pelajaran sudah terdaftar.")
      await course.create({
        id: nanoid(36),
        name,
        courseIdentifier,
        grade,
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
        courseIdentifier,
        grade,
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

exports.getAllCourse = async (req, res, next) => {
  try {
    const activeCurriculum = await getCurriculumActive()
    if (!activeCurriculum) return response.res200(res, "001", "Belum ada kurikulum yang aktif")

    const allCourse = await getAllCourse(activeCurriculum.id)
    if (allCourse.length < 1) return response.res200(res, "001", "Belum ada daftar pelajaran pada kurikulum yang aktif")

    return response.res200(res, "000", "Sukses mendapatkan data semua pelajaran pada kurikulum aktif", allCourse)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}
