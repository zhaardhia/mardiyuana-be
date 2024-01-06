const response = require("../../components/response")
const { db } = require("../../components/database");
const Validator = require("fastest-validator");
const v = new Validator();
const { INSERT_UPDATE_REMINDER_COURSE } = require("../../middleware/schema-validator")
const moment = require("moment");
const { isString } = require("../../middleware/validator");
const { nanoid } = require("nanoid");
const { 
  getListReminderCourseBySectionAndAcademicYear,
  getDetailReminderCourseById,
  insertReminderCourse,
  updateReminderCourse
} = require("../query/reminderCourse")
const { 
  checkSchoolClassStatus
} = require("../query/schoolClass")
const { 
  checkTeacherFullname
} = require("../query/teacher")

exports.getAllReminderCourse = async (req, res, next) => {
  const { user } = req
  if (!user) return response.res400(res, "user is not logged in.")

  const { courseSectionId, academicYearId, classId, numberSection } = req.query
  if (!courseSectionId || !academicYearId || !classId) return response.res400(res, "courseSectionId, academicYearId & classId is required.")

  try {
    const getListReminderCourses = await getListReminderCourseBySectionAndAcademicYear({ 
      academicYearId,
      courseSectionId,
      numberSection: numberSection || 0,
      classId
    })
    if (getListReminderCourses.length < 1) return response.res200(res, "001", "Belum ada reminder pelajaran untuk bab ini.")

    return response.res200(res, "000", "Sukses mendapatkan data reminder pelajaran.", getListReminderCourses)
  } catch (error) {
    console.log(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}

exports.insertUpdateReminderCourse = async (req, res, next) => {
  const { user } = req
  if (!user) return response.res400(res, "user is not logged in.")

  const payloadCheck = await v.compile(INSERT_UPDATE_REMINDER_COURSE);
  const resPayloadCheck = await payloadCheck(req.body);

  if (resPayloadCheck !== true) {
    return response.res400(res, resPayloadCheck[0].message)
  }

  try {
    const { id, academicYearId, courseSectionId, numberSection, classId, title, body } = req.body

    const getTeacherData = await checkTeacherFullname(user.userId)
    if (!getTeacherData) return response.res400(res, "teacher is not active.")

    const getClassData = await checkSchoolClassStatus(classId)
    if (!getClassData) return response.res400(res, "class is not active.")

    const payload = {
      academicYearId,
      courseSectionId,
      numberSection,
      classId,
      className: getClassData.name,
      teacherId: getTeacherData.id,
      teacherName: getTeacherData.fullname,
      title,
      body,
      ...(!id && { id: nanoid(36), createdDate: new Date() }),
      updatedDate: new Date()
    }

    if (id) {
      await updateReminderCourse({
        id,
        payload
      })
      return response.res200(res, "000", "Sukses mengubah data reminder pelajaran.", { id, ...payload })
    } else {
      await insertReminderCourse(payload)
      return response.res200(res, "000", "Sukses memasukkan data reminder pelajaran.")
    }
  } catch (error) {
    console.log(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}

exports.getDetailReminderCourse = async (req, res, next) => {
  const { user } = req
  if (!user) return response.res400(res, "user is not logged in.")

  const { id } = req.query
  if (!id) return response.res400(res, "id is required.")

  try {
    const getReminderCourse = await getDetailReminderCourseById({ id })
    if (!getReminderCourse) return response.res200(res, "001", "Data reminder tidak ditemukan.")
    console.log({getReminderCourse})
    return response.res200(res, "000", "Sukses mendapatkan data reminder pelajaran.", getReminderCourse)
  } catch (error) {
    console.log(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}
