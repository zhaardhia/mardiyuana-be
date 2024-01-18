const response = require("../../components/response")
const { db, course, course_section } = require("../../components/database");
const moment = require("moment");
const Validator = require("fastest-validator");
const v = new Validator();
const { INSERT_COURSE_SECTION } = require("../../middleware/schema-validator");
const { isString } = require("../../middleware/validator");
const { nanoid } = require("nanoid");
const { checkCourseStatusByCourseId } = require("../query/course")
const { checkCourseSectionNumberSection, getAllCourseSectionById } = require("../query/courseSection")

exports.insertUpdateCourseSection = async (req, res, next) => {
  const payloadCheck = await v.compile(INSERT_COURSE_SECTION);
  const resPayloadCheck = await payloadCheck(req.body);

  if (resPayloadCheck !== true) {
    return response.res400(res, resPayloadCheck[0].message)
  }

  const { id, courseId, numberSection, name, description } = req.body

  try {
    const checkCourse = await checkCourseStatusByCourseId(courseId)
    if (!checkCourse) return response.res200(res, "001", "Pelajaran tidak terdaftar.")

    if (!id) {
      const checkCourseSectionNumber = await checkCourseSectionNumberSection(courseId, numberSection)
      if (checkCourseSectionNumber) return response.res200(res, "001", `Bab nomor ${numberSection} pelajaran ${checkCourse.name} sudah terdaftar.`)

      const sectionObj = {
        id: nanoid(36),
        courseId,
        numberSection,
        name,
        description,
        createdDate: new Date(),
        updatedDate: new Date()
      }
      await course_section.create({
        ...sectionObj
      })
      return response.res200(res, "000", `Sukses memasukkan data bab pelajaran ${checkCourse.name}`, sectionObj)
    }

    await course_section.update(
      {
        name,
        description,
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

exports.getAllCourseSectionByCourseId = async (req, res, next) => {
  const { id } = req.query
  if (!id) return response.res400(res, "id is required.")

  try {
    const getCourse = await checkCourseStatusByCourseId(id)
    if (!getCourse) return response.res200(res, "001", "Pelajaran tidak ditemukan.")

    const getAllCourseSection = await getAllCourseSectionById(id)
    // if (getAllCourseSection.length < 1) return response.res200(res, "001", "Belum ada data bab yang ditambahkan pada pelajaran ini.")

    if (getAllCourseSection.length > 0) getAllCourseSection.sort((a, b) => a.numberSection - b.numberSection)

    const responseObj = {
      course: {
        id: getCourse.id,
        name: getCourse.name,
        grade: getCourse.grade
      },
      sections: getAllCourseSection
    }
    return response.res200(res, "000", "Sukses mengambil data bab pada pelajaran ini.", responseObj)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}

exports.reorderCourseSections = async (req, res, next) => {
  const { startIndex, endIndex, courseId } = req.body
  console.log(isNaN(startIndex), !startIndex && !endIndex)
  if (!startIndex && !endIndex && courseId) return response.res400(res, "check the inputted data.")
  if (isNaN(startIndex) || isNaN(endIndex)) return response.res400(res, "check the inputted data.")
  try {
    const getAllCourseSectionByCourseId = await getAllCourseSectionById(courseId)
    console.log({getAllCourseSectionByCourseId})
    const removed = getAllCourseSectionByCourseId.splice(startIndex, 1)[0];
    getAllCourseSectionByCourseId.splice(endIndex, 0, removed);

    const mapSections = getAllCourseSectionByCourseId.map((data, idx) => ({ ...data, numberSection: idx }))
    console.log({mapSections})
    for (const section of mapSections) {
      await course_section.update(
        {
          numberSection: section.numberSection,
          updatedDate: new Date()
        },
        {
          where: {
            id: section.id
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
