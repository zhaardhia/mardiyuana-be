const response = require("../../components/response")
const { db, course, course_section } = require("../../components/database");
const moment = require("moment");
const Validator = require("fastest-validator");
const v = new Validator();
const { INSERT_COURSE_SECTION } = require("../../middleware/schema-validator");
const { isString } = require("../../middleware/validator");
const { nanoid } = require("nanoid");
const { checkCourseStatus } = require("../query/course")
const { checkCourseSectionNumberSection } = require("../query/courseSection")

exports.insertUpdateCourseSection = async (req, res, next) => {
  const payloadCheck = await v.compile(INSERT_COURSE_SECTION);
  const resPayloadCheck = await payloadCheck(req.body);

  if (resPayloadCheck !== true) {
    return response.res400(res, "Mohon cek kembali kelengkapan data yang telah dikirim.")
  }

  const { id, courseId, numberSection, name } = req.body

  try {
    const checkCourse = await checkCourseStatus(courseId)
    if (!checkCourse) return response.res200(res, "001", "Pelajaran tidak terdaftar.")

    const checkCourseSectionNumber = await checkCourseSectionNumberSection(numberSection)
    if (checkCourseSectionNumber) return response.res200(res, "001", `Bab nomor ${numberSection} pelajaran ${checkCourse.name} sudah terdaftar.`)

    if (!id) {
      await course_section.create({
        id: nanoid(36),
        courseId,
        numberSection,
        name,
        createdDate: new Date(),
        updatedDate: new Date()
      })
      return response.res200(res, "000", `Sukses memasukkan data bab pelajaran ${checkCourse.name}`)
    }

    await course_section.update(
      {
        numberSection,
        name,
        updatedDate: new Date()
      },
      {
        where: {
          id,
          courseId
        }
      }
    )
    return response.res200(res, "000", `Sukses mengubah data pelajaran ${name}`)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal. Mohon cek kembali data yang dibuat.")
  }
}
