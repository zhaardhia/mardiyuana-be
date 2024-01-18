const response = require("../../components/response")
const Validator = require("fastest-validator");
const { db } = require("../../components/database")
const v = new Validator();
const { 
  INSERT_UPDATE_SCORE_COURSE,
  GET_ALL_SCORE_COURSE,
  GET_LIST_SCORE_COURSE_STUDENT,
  EDIT_LIST_SCORE_COURSE_STUDENT 
} = require("../../middleware/schema-validator")
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
  getSchoolCourseDetail,
  getListScoreCourseStudentPage,
  totalCountListScoreCourseStudentPage,
  editScoreCourseStudent,
  getDetailScoreCourseStudent
} = require("../query/scoreCourse")
const {
  getAllEnrollmentStudentByClassIdForInsertScore,
  getClassAndAcademicYearByEnrollmentId
} = require("../query/enrollmentStudent")
const {
  getClassCourseAndAcademicYearByEnrollmentTeacherId
} = require("../query/enrollmentTeacher")

exports.getAllScoreCourseInTeacher = async (req, res, next) => {
  const { user } = req
  if (!user) return response.res400(res, "user is not logged in.")

  const payloadCheck = await v.compile(GET_ALL_SCORE_COURSE);
  const resPayloadCheck = await payloadCheck(req.query);

  if (resPayloadCheck !== true) {
    return response.res400(res, resPayloadCheck[0].message)
  }

  const { courseId, type, id } = req.query
  
  try {
    const enrollmentData = await getClassCourseAndAcademicYearByEnrollmentTeacherId({ id })
    const { academicYearId, classId } = enrollmentData

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

exports.getAllScoreCourseWithScore = async (req, res, next) => {
  const { user } = req
  if (!user) return response.res400(res, "user is not logged in.")

  const payloadCheck = await v.compile(GET_ALL_SCORE_COURSE);
  const resPayloadCheck = await payloadCheck(req.query);

  if (resPayloadCheck !== true) {
    return response.res400(res, resPayloadCheck[0].message)
  }

  const { id, courseId, type } = req.query
  
  const getEnrollmentData = await getClassAndAcademicYearByEnrollmentId({ id })
  const { classId, academicYearId } = getEnrollmentData

  try {
    const getListScoreCourse = await getAllSchoolCourse({
      academicYearId,
      classId,
      courseId,
      type
    })
    if (getListScoreCourse.length < 1) return response.res200(res, "001", "Belum ada data tugas / ulangan yang terpilih.")

    const listScoreCourse = await Promise.all(
      getListScoreCourse.map( async (scoreCourse) => {
        const detailScoreCourse = await getDetailScoreCourseStudent(scoreCourse.id, user.isParent ? user.studentId : user.userId)
        return { ...scoreCourse, ...detailScoreCourse }
      })
    )
    // {
    //   "id": "IXuBWuCmb9uSqoJXm7TWXoE8OBRaFU6jSoOg",
    //   "title": "Aljabar hehehe",
    //   "scoreDue": "2024-01-15T10:15:56.000Z",
    //   "updatedDate": "2024-01-07T10:15:56.000Z"
    // }
    return response.res200(res, "000", "Sukses mendapatkan data tugas / ulangan.", listScoreCourse)
  } catch (error) {
    console.log(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}

exports.insertUpdateScoreCourse = async (req, res, next) => {
  const { user } = req
  if (!user) return response.res400(res, "user is not logged in.")
  const payload = {
    ...req.body,
    scoreDue: new Date(req.body.scoreDue)
  }

  const payloadCheck = await v.compile(INSERT_UPDATE_SCORE_COURSE);
  const resPayloadCheck = await payloadCheck(payload);

  if (resPayloadCheck !== true) {
    return response.res400(res, resPayloadCheck[0].message)
  }
  const { id, title, body, type, classId, courseId, scoreDue } = payload
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
          type,
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
      return response.res200(res, "000", "Sukses memasukkan data score murid.", { id: scoreCourseId })
    }
  } catch (error) {
    console.log(error)

    if (dbTransaction) await dbTransaction.rollback()
    return response.res200(res, "001", "Interaksi gagal.")
  }
}

exports.getListScoreCourseStudent = async (req, res, next) => {
  const payload = {
    page: Number(req.query.page) || undefined,
    pageSize: Number(req.query.pageSize) || undefined,
    scoreCourseId: req.query.scoreCourseId || '',
  }

  const payloadCheck = await v.compile(GET_LIST_SCORE_COURSE_STUDENT);
  const resPayloadCheck = await payloadCheck(payload);

  if (resPayloadCheck !== true) {
    return response.res400(res, resPayloadCheck[0].message)
  }

  const { user } = req;
  if (!user) return response.res400(res, "user is not logged in.")

  const { page, pageSize, scoreCourseId } = payload
  try {
    const getListStudents = await getListScoreCourseStudentPage(
      page,
      pageSize,
      scoreCourseId
    )
    console.log({getListStudents})
    const totalData = await totalCountListScoreCourseStudentPage(
      scoreCourseId
    );

    const totalPages = Math.ceil(totalData / pageSize);
    const nextPage = getListStudents.length > pageSize ? page + 1 : null
    // console.log({dataStudent})
    if (getListStudents.length > pageSize) getListStudents.pop();

    const responseData = {
      listStudentScore: [...getListStudents],
      totalData,
      totalPages,
      nextPage
    }

    return response.res200(res, "000", "Sukses mendapatkan data score murid.", responseData)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}

exports.editScoreCourseStudent = async (req, res, next) => {
  const payload = {
    score: Number(req.body.score) || undefined,
    status: req.body.status || '',
    scoreCourseStudentId: req.body.scoreCourseStudentId || '',
  }
  console.log({payload})
  const payloadCheck = await v.compile(EDIT_LIST_SCORE_COURSE_STUDENT);
  const resPayloadCheck = await payloadCheck(payload);

  if (resPayloadCheck !== true) {
    return response.res400(res, resPayloadCheck[0].message)
  }

  const { user } = req;
  if (!user) return response.res400(res, "user is not logged in.")

  const { score, status, scoreCourseStudentId } = payload

  try {
    await editScoreCourseStudent({
      id: scoreCourseStudentId,
      score,
      status
    })
    return response.res200(res, "000", "Sukses mengubah data score murid.")
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}
