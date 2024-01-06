const response = require("../../components/response")
const { db } = require("../../components/database");
const Validator = require("fastest-validator");
const v = new Validator();
const { INSERT_UPDATE_TEACHER_NOTE } = require("../../middleware/schema-validator")
const moment = require("moment");
const { isString } = require("../../middleware/validator");
const { nanoid } = require("nanoid");
const { checkAcademicYearThatActive } = require("../query/academicYear")
const { getStudentAndParent } = require("../query/student")
const { checkTeacherFullname } = require("../query/teacher")
const { checkSchoolClassStatus } = require("../query/schoolClass")
const { insertTeacherNote, updateTeacherNote, getListTeacherNotesOnTeacher } = require("../query/teacherNote")


exports.getAllTeacherNotes = async (req, res, next) => {
  const { user } = req
  if (!user) return response.res400(res, "user is not logged in.")

  const { studentId, classId } = req.query
  if (!studentId || !classId) return response.res400(res, "studentId & classId is required.")

  try {
    const getActiveAcademicYear = await checkAcademicYearThatActive()
    const getListTeacherNotes = await getListTeacherNotesOnTeacher({ 
      academicYearId: getActiveAcademicYear.id,
      classId,
      studentId,
      teacherId: user.userId
    })
    if (getListTeacherNotes.length < 1) return response.res200(res, "001", "Belum ada notes.")

    return response.res200(res, "000", "Sukses mendapatkan data notes.", getListTeacherNotes)
  } catch (error) {
    console.log(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}

exports.insertUpdateTeacherNote = async (req, res, next) => {
  const { user } = req
  if (!user) return response.res400(res, "user is not logged in.")
  console.log({user})
  const payloadCheck = await v.compile(INSERT_UPDATE_TEACHER_NOTE);
  const resPayloadCheck = await payloadCheck(req.body);

  if (resPayloadCheck !== true) {
    return response.res400(res, resPayloadCheck[0].message)
  }

  try {
    const { id, title, body, studentId, classId } = req.body

    const getActiveAcademicYear = await checkAcademicYearThatActive()
    const getTeacherData = await checkTeacherFullname(user.userId)
    if (!getTeacherData) return response.res400(res, "teacher is not active.")

    const getClassData = await checkSchoolClassStatus(classId)
    if (!getClassData) return response.res400(res, "class is not active.")

    const getStudent = await getStudentAndParent({ studentId })
    if (!getStudent) return response.res400(res, "class is not active.")

    const payload = {
      title,
      body,
      teacherId: getTeacherData.id,
      teacherName: getTeacherData.fullname,
      studentId,
      parentId: getStudent.parentId,
      academicYearId: getActiveAcademicYear.id,
      classId,
      ...(!id && { id: nanoid(36), createdDate: new Date() }),
      updatedDate: new Date()
    }

    if (id) {
      await updateTeacherNote({
        id,
        payload
      })
      return response.res200(res, "000", "Sukses mengubah data notes.", { id, ...payload })
    } else {
      await insertTeacherNote(payload)
      return response.res200(res, "000", "Sukses memasukkan data notes.")
    }
  } catch (error) {
    console.log(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}
