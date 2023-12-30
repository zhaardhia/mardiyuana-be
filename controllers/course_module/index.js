const response = require("../../components/response")
const { db, course, course_module } = require("../../components/database");
const moment = require("moment");
const Validator = require("fastest-validator");
const v = new Validator();
const { INSERT_COURSE_MODULE } = require("../../middleware/schema-validator");
const { isString } = require("../../middleware/validator");
const { nanoid } = require("nanoid");
const { checkCourseStatusByCourseId } = require("../query/course")
const { checkCourseSectionAvail } = require("../query/courseSection")
const { checkCourseModuleNumberModule, getAllCourseModuleByCourseSectionId } = require("../query/courseModule")

exports.insertUpdateCourseModule = async (req, res, next) => {
  const payloadCheck = await v.compile(INSERT_COURSE_MODULE);
  const resPayloadCheck = await payloadCheck(req.body);

  if (resPayloadCheck !== true) {
    return response.res400(res, "Mohon cek kembali kelengkapan data yang telah dikirim.")
  }

  const { id, courseSectionId, courseId, numberModule, content, url, isSupportedMaterial } = req.body

  try {
    const checkCourse = await checkCourseStatusByCourseId(courseId)
    if (!checkCourse) return response.res200(res, "001", "Pelajaran tidak terdaftar.")

    const checkCourseSection = await checkCourseSectionAvail(courseSectionId)
    if (!checkCourseSection) return response.res200(res, "001", "Bab Pelajaran tidak terdaftar.")

    const typeModule = isSupportedMaterial ? "SUPPORTED_MATERIAL" : "MODULE"
    if (!id) {
      const checkCourseModuleNumber = await checkCourseModuleNumberModule(courseSectionId, numberModule, typeModule)
      if (checkCourseModuleNumber) return response.res200(res, "001", `Materi nomor ${numberModule} pada Bab ${checkCourseSection.name} pelajaran ${checkCourse.name} sudah terdaftar.`)

      const objResponse = {
        id: nanoid(36),
        courseSectionId,
        courseId,
        numberModule,
        content,
        ...(isSupportedMaterial && { url }),
        type: isSupportedMaterial ? "SUPPORTED_MATERIAL" : "MODULE",
        createdDate: new Date(),
        updatedDate: new Date()
      }
      await course_module.create({
        ...objResponse
      })
      return response.res200(res, "000", `Sukses memasukkan data bab pelajaran ${checkCourse.name}`, objResponse)
    }

    await course_module.update(
      {
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

exports.getAllCourseModuleByCourseSectionId = async (req, res, next) => {
  const { id } = req.query
  if (!id) return response.res400(res, "id is required.")

  try {
    const checkCourseSection = await checkCourseSectionAvail(id)
    if (!checkCourseSection) return response.res200(res, "001", "Bab Pelajaran tidak terdaftar.")

    const checkCourse = await checkCourseStatusByCourseId(checkCourseSection.courseId)
    if (!checkCourse) return response.res200(res, "001", "Pelajaran tidak terdaftar.")

    const getAllCourseModule = await getAllCourseModuleByCourseSectionId(id)

    let modules = getAllCourseModule.filter((module) => module.type === "MODULE") || [];
    let supportedMaterials = getAllCourseModule.filter((material) => material.type === "SUPPORTED_MATERIAL") || []

    modules = modules.length > 0 ? modules.sort((a, b) => a.numberSection - b.numberSection) : []
    supportedMaterials = supportedMaterials.length > 0 ? supportedMaterials.sort((a, b) => a.numberSection - b.numberSection) : []

    const responseObj = {
      course: {
        id: checkCourse.id,
        name: checkCourse.name,
        grade: checkCourse.grade
      },
      courseSection: {
        id: checkCourseSection.id,
        name: checkCourseSection.name,
      },
      courseModules: {
        modules,
        supportedMaterials
      }
    }
    return response.res200(res, "000", "Sukses mengambil data bab pada pelajaran ini.", responseObj)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}

exports.reorderCourseModule = async (req, res, next) => {
  const { startIndex, endIndex, courseSectionId, type } = req.body
  console.log(isNaN(startIndex), !startIndex && !endIndex)
  if (!startIndex && !endIndex && courseSectionId) return response.res400(res, "check the inputted data.")
  if (isNaN(startIndex) || isNaN(endIndex)) return response.res400(res, "check the inputted data.")

  if (!["MODULE", "SUPPORTED_MATERIAL"].includes(type)) return response.res400(res, "check the inputted data.")

  try {
    const getAllModuleBySectionId = await getAllCourseModuleByCourseSectionId(courseSectionId, type)
    console.log({getAllModuleBySectionId})
    const removed = getAllModuleBySectionId.splice(startIndex, 1)[0];
    getAllModuleBySectionId.splice(endIndex, 0, removed);

    const mapModules = getAllModuleBySectionId.map((data, idx) => ({ ...data, numberModule: idx }))
    console.log({mapModules})
    for (const module of mapModules) {
      await course_module.update(
        {
          numberModule: module.numberModule,
          updatedDate: new Date()
        },
        {
          where: {
            id: module.id
          }
        }
      )
    }
    return response.res200(res, "000", "Sukses mengubah urutan data bab pada pelajaran ini.")
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}