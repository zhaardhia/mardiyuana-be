const response = require("../../components/response")
const Validator = require("fastest-validator");
const { db } = require("../../components/database")
const v = new Validator();
const { INSERT_UPDATE_SCORE_COURSE, GET_ALL_SCORE_COURSE } = require("../../middleware/schema-validator")
const moment = require("moment");
const { nanoid } = require("nanoid");
const { 
  checkSchoolClassStatus
} = require("../query/schoolClass")
const { 
  checkCourseStatusByCourseId
} = require("../query/course")
const { 
  checkAcademicYearThatActive
} = require("../query/academicYear")
const {
  insertScoreCourse,
  updateScoreCourse,
  insertScoreCourseStudent,
  getAllSchoolCourse,
  getSchoolCourseDetail
} = require("../query/scoreCourse")
const {
  getAllEnrollmentStudentByClassIdForInsertScore
} = require("../query/enrollmentStudent")

exports.getAllScoreCourseInTeacher = async (req, res, next) => {
  const { user } = req
  if (!user) return response.res400(res, "user is not logged in.")

  const payloadCheck = await v.compile(GET_ALL_SCORE_COURSE);
  const resPayloadCheck = await payloadCheck(req.query);

  if (resPayloadCheck !== true) {
    return response.res400(res, resPayloadCheck[0].message)
  }

  const { academicYearId, classId, courseId, type } = req.query
  
  try {
    const getListScoreCourse = await getAllSchoolCourse({
      academicYearId,
      classId,
      courseId,
      type
    })
    if (getListScoreCourse.length < 1) return response.res200(res, "001", "Belum ada data tugas / ulangan yang terpilih.")

    return response.res200(res, "000", "Sukses mendapatkan data tugas / ulangan.", getListScoreCourse)
  } catch (error) {
    console.log(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}

exports.getDetailScoreCourse = async (req, res, next) => {
  const { user } = req
  if (!user) return response.res400(res, "user is not logged in.")

  const { id } = req.query
  if (!id) return response.res400(res, "id is required.")

  try {
    const detailScoreCourse = await getSchoolCourseDetail({ id })
    if (!detailScoreCourse) return response.res200(res, "001", "data detail tugas / ujian tidak ditemukan.")

    const getCourse = await checkCourseStatusByCourseId(detailScoreCourse.courseId)
    const getClass = await checkSchoolClassStatus(detailScoreCourse.classId)
    
    const objResponse = {
      ...detailScoreCourse,
      course: {
        id: getCourse.id,
        name: getCourse.name
      },
      class: {
        id: getClass.id,
        name: getClass.name
      }
    }
    return response.res200(res, "000", "Sukses mendapatkan data tugas / ulangan.", objResponse)
  } catch (error) {
    console.log(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}

exports.insertUpdateScoreCourse = async (req, res, next) => {
  const { user } = req
  if (!user) return response.res400(res, "user is not logged in.")

  const payloadCheck = await v.compile(INSERT_UPDATE_SCORE_COURSE);
  const resPayloadCheck = await payloadCheck(req.body);

  if (resPayloadCheck !== true) {
    return response.res400(res, resPayloadCheck[0].message)
  }
  const { id, title, body, type, classId, courseId, scoreDue } = req.body
  const dbTransaction = !id ? await db.transaction() : null

  try {
    const getClassData = await checkSchoolClassStatus(classId)
    if (!getClassData) return response.res400(res, "class is not active.")

    const getCourseData = await checkCourseStatusByCourseId(courseId)
    if (!getCourseData) return response.res400(res, "course is not active.")

    const getActiveAcademicYear = await checkAcademicYearThatActive()
    if (!getActiveAcademicYear) return response.res400(res, "there is no active academicYear yet.")

    const getAllEnrollmentStudent = await getAllEnrollmentStudentByClassIdForInsertScore({
      academicYearId: getActiveAcademicYear.id,
      classId,
    })
    if (getAllEnrollmentStudent.length < 10) return response.res400(res, "please check all the registered student in this class before create score.")

    const scoreCourseId = nanoid(36)
    const payload = {
      title,
      body,
      type,
      academicYearId: getActiveAcademicYear.id,
      classId,
      courseId,
      scoreDue,
      ...(!id && { id: scoreCourseId, createdDate: new Date(), transaction: dbTransaction }),
      updatedDate: new Date()
    }

    if (id) {
      await updateScoreCourse({
        id,
        payload
      })
      return response.res200(res, "000", "Sukses mengubah data score murid.", { id, ...payload })
    } else {
      const mapStudentPayload = getAllEnrollmentStudent.map((student) => {
        return {
          id: nanoid(36),
          scoreCourseId: scoreCourseId,
          score: 0,
          status: "NOT_DONE",
          studentId: student.studentId,
          courseId,
          classId,
          academicYearId: getActiveAcademicYear.id,
          createdDate: new Date(),
          updatedDate: new Date()
        }
      })
      await insertScoreCourse(payload)
      await insertScoreCourseStudent(mapStudentPayload, dbTransaction)

      await dbTransaction.commit()
      return response.res200(res, "000", "Sukses memasukkan data score murid.")
    }
  } catch (error) {
    console.log(error)

    if (dbTransaction) await dbTransaction.rollback()
    return response.res200(res, "001", "Interaksi gagal.")
  }
}
