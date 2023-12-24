const response = require("../../components/response")
const { db, course, course_module } = require("../../components/database");
const moment = require("moment");
const Validator = require("fastest-validator");
const v = new Validator();
const { INSERT_COURSE_MODULE } = require("../../middleware/schema-validator");
const { isString } = require("../../middleware/validator");
const { nanoid } = require("nanoid");
const { checkCourseStatus } = require("../query/course")
const { checkCourseSectionNumberSection, checkCourseSectionAvail } = require("../query/courseSection")
const { checkCourseModuleNumberModule } = require("../query/courseModule")

exports.insertUpdateCourseModule = async (req, res, next) => {
  const payloadCheck = await v.compile(INSERT_COURSE_MODULE);
  const resPayloadCheck = await payloadCheck(req.body);

  if (resPayloadCheck !== true) {
    return response.res400(res, "Mohon cek kembali kelengkapan data yang telah dikirim.")
  }

  const { id, courseSectionId, courseId, numberModule, content, url, isSupportedMaterial } = req.body

  try {
    const checkCourse = await checkCourseStatus(courseId)
    if (!checkCourse) return response.res200(res, "001", "Pelajaran tidak terdaftar.")

    const checkCourseSection = await checkCourseSectionAvail(courseSectionId)
    if (!checkCourseSection) return response.res200(res, "001", "Bab Pelajaran tidak terdaftar.")

    const checkCourseModuleNumber = await checkCourseModuleNumberModule(numberModule)
    if (checkCourseModuleNumber) return response.res200(res, "001", `Materi nomor ${numberModule} pada Bab ${checkCourseSection.name} pelajaran ${checkCourse.name} sudah terdaftar.`)

    if (!id) {
      await course_module.create({
        id: nanoid(36),
        courseSectionId,
        courseId,
        numberModule,
        content,
        ...(isSupportedMaterial && { url }),
        type: isSupportedMaterial ? "SUPPORTED_MATERIAL" : "MODULE",
        createdDate: new Date(),
        updatedDate: new Date()
      })
      return response.res200(res, "000", `Sukses memasukkan data bab pelajaran ${checkCourse.name}`)
    }

    await course_module.update(
      {
        numberSection,
        content,
        ...(url && { url }),
        updatedDate: new Date()
      },
      {
        where: {
          id,
          courseSectionId
        }
      }
    )
    return response.res200(res, "000", `Sukses memasukkan data bab pelajaran ${checkCourse.name}`)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal. Mohon cek kembali data yang dibuat.")
  }
}
