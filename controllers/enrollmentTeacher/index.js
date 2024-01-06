const response = require("../../components/response")
const { db } = require("../../components/database");
const Validator = require("fastest-validator");
const v = new Validator();
const { INSERT_ENROLLMENT_TEACHER } = require("../../middleware/schema-validator")
const { 
  checkEnrollmentTeacherIsRegistered,
  checkEnrollmentTeacherHomeroomIsRegistered,
  insertEnrollmentTeacher,
  getAllEnrollTeacherByAcademicYear,
  getAllEnrollTeacherAndCourseByAcademicYear,
  getAllEnrollTeacherHomeroomByAcademicYear,
  checkTeacherIsAlreadyRegisteredAsHomeroom,
  getAllEnrolledTeacherClassByAcademicYear
} = require("../query/enrollmentTeacher")
const { 
  checkSchoolClassStatus,
  getAllClassWithGrade
} = require("../query/schoolClass")
const { 
  checkAcademicYearIsRegistered,
  checkAcademicYearThatActive,
  getLatestFiveAcademicYear,
  getDetailAcademicYear
} = require("../query/academicYear")
const { 
  checkCourseStatus,
  getCourseDetailById,
  getInitialCourseDetailById,
  getCourseSectionsAndModules
} = require("../query/course")
const { 
  checkTeacherFullname,
} = require("../query/teacher")
const { courseConstant } = require("../utils/data")
const moment = require("moment")


exports.insertEnrollmentTeacher = async (req, res, next) => {
  console.log({req: req.body})
  const payloadCheck = await v.compile(INSERT_ENROLLMENT_TEACHER);
  const resPayloadCheck = await payloadCheck(req.body);

  if (resPayloadCheck !== true) {
    return response.res400(res, "Mohon cek kembali kelengkapan data yang telah dikirim.")
  }

  try {
    const { teacherId, classId, courseValue, isHomeRoom, homeRoomClassId } = req.body;

    const checkTeacher = await checkTeacherFullname(teacherId)
    if (!checkTeacher) return response.res200(res, "001", `Guru belum terdaftar.`)

    const checkAcademicYear = await checkAcademicYearThatActive()
    const academicYearId = checkAcademicYear.id;

    if (isHomeRoom) {
      const checkClass = await checkSchoolClassStatus(homeRoomClassId)
      if (!checkClass) return response.res200(res, "001", `Kelas belum terdaftar dalam sistem.`)

      const checkEnrollmentTeacher = await checkEnrollmentTeacherHomeroomIsRegistered(academicYearId, homeRoomClassId)
      if (checkEnrollmentTeacher) return response.res200(res, "001", "Wali kelas pada kelas tersebut sudah terdaftar pada tahun ajaran ini.")

      const checkIsTeacherAlreadyAsHomeroom = await checkTeacherIsAlreadyRegisteredAsHomeroom(teacherId, academicYearId)
      if (checkIsTeacherAlreadyAsHomeroom) return response.res200(res, "001", "Guru ini sudah terdaftar menjadi wali kelas.")

      await insertEnrollmentTeacher({ 
        teacherId,
        teacherName: checkTeacher.fullname,
        academicYearId,
        academicYear: checkAcademicYear.academicYear,
        classId: homeRoomClassId,
        className: checkClass.name,
        teacherType: "HOMEROOM",
      })
      return response.res200(res, "000", `Sukses mendaftarkan wali kelas ${checkClass.name} ke tahun ajaran ${checkAcademicYear.academicYear}`)
    }


    const checkClass = await checkSchoolClassStatus(classId)
    if (!checkClass) return response.res200(res, "001", `Kelas belum terdaftar dalam sistem.`)

    const checkCourse = await checkCourseStatus(courseValue, checkClass.name.charAt(0))
    if (!checkCourse) return response.res200(res, "001", `Pelajaran belum terdaftar.`)
    const courseId = checkCourse.id

    const checkEnrollmentTeacher = await checkEnrollmentTeacherIsRegistered(academicYearId, classId, courseId)
    if (checkEnrollmentTeacher) return response.res200(res, "001", "Guru sudah terdaftar pada tahun ajaran ini.")

    await insertEnrollmentTeacher({ 
      teacherId,
      teacherName: checkTeacher.fullname,
      academicYearId,
      academicYear: checkAcademicYear.academicYear,
      classId,
      className: checkClass.name,
      courseId,
      courseName: checkCourse.name,
      teacherType: "NORMAL",
    })

    return response.res200(res, "000", `Sukses mendaftarkan guru ke tahun ajaran ${checkAcademicYear.academicYear}`)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Register Gagal. Mohon cek kembali data pendaftaran guru yang dibuat.")
  }
}

exports.getEnrolledTeacherByAcademicYear = async (req, res, next) => {
  const { teacherId, academicYearId } = req.query
  if (!teacherId) return response.res400(res, "teacherId is required.")

  const checkTeacher = await checkTeacherFullname(teacherId)
  if (!checkTeacher) return response.res400(res, "Guru tidak aktif");

  let getActiveAcademicYear = null
  if (!academicYearId) getActiveAcademicYear = await checkAcademicYearThatActive();

  try {
    const getAllEnrollmentTeacher = await getAllEnrollTeacherByAcademicYear(academicYearId || getActiveAcademicYear.id, teacherId)
    if (getAllEnrollmentTeacher.length < 1) return response.res200(res, "001", "Belum ada enrollment pada tahun ajaran ini.")
    
    return response.res200(res, "000", "Sukses mendapatkan enrollment guru pada tahun ajaran aktif", getAllEnrollmentTeacher)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Gagal mendapatkan data enrollment guru. Mohon cek kembali data guru tersebut.")
  }
}

exports.initialDataEnrollmentTeacher = async (req, res, next) => {
  const { teacherId, teacherType } = req.query
  if (!teacherId || teacherId === undefined) return response.res400(res, "studentId is required.")

  try {
    const getSchoolClass = await getAllClassWithGrade();
    const responseAllClass = getSchoolClass?.map((classRoom) => {
      return { label: classRoom.name, value: classRoom.id }
    }).sort((a, b) => a.label.localeCompare(b.label))
    const getActiveAcademicYear = await checkAcademicYearThatActive()

    if (teacherType === "NORMAL" || !teacherType) {
      const getAlreadyEnrolled = await getAllEnrollTeacherAndCourseByAcademicYear(getActiveAcademicYear.id, teacherId)
      const objResult = [];

      for (const classObj of getSchoolClass) {
        for (const subject of courseConstant) {
          const findSupportedClass = subject.grade.find(grade => grade === Number(classObj.name.charAt(0)))

          if (!findSupportedClass) continue; 

          const findAlreadyEnrolled = getAlreadyEnrolled.find(enrollment => enrollment.classId === classObj.id && subject.value === enrollment?.course?.courseIdentifier)

          if (!findAlreadyEnrolled) {
            objResult.push(
              {
                classId: classObj.id,
                className: classObj.name,
                courseValue: subject.value,
                courseLabel: subject.label,
                isSupportEnroll: true
              }
            )
          } else objResult.push(
            {
              classId: classObj.id,
              className: classObj.name,
              courseValue: subject.value,
              courseLabel: subject.label,
              isSupportEnroll: false
            }
          )
        }
      }

      // Sort the array by className in ascending order
      const sortedData = objResult.slice().sort((a, b) => a.className.localeCompare(b.className));
      return response.res200(res, "000", "Sukses mendapatkan initial data untuk enrollment guru", {
        classes: responseAllClass,
        enroll_data: sortedData
      })
    } else {
      const getAlreadyEnrolled = await getAllEnrollTeacherHomeroomByAcademicYear(getActiveAcademicYear.id, teacherId)

      const objResult = []
      for (const classObj of getSchoolClass) {

        const findAlreadyEnrolled = getAlreadyEnrolled.find(enrollment => enrollment.classId === classObj.id)

          if (!findAlreadyEnrolled) {
            objResult.push(
              {
                classId: classObj.id,
                className: classObj.name,
                isSupportEnroll: true
              }
            )
          } else objResult.push(
            {
              classId: classObj.id,
              className: classObj.name,
              isSupportEnroll: false
            }
          )
      }
      // Sort the array by className in ascending order
      const sortedData = objResult.slice().sort((a, b) => a.className.localeCompare(b.className));
      return response.res200(res, "000", "Sukses mendapatkan initial data untuk enrollment guru", {
        classes: responseAllClass,
        enroll_data: sortedData
      })
    }
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Gagal mendapatkan data enrollment guru. Mohon cek kembali data guru tersebut.")
  }
}

// Teacher Side
exports.getAllEnrolledClass = async (req, res, next) => {
  const { user } = req
  if (!user) return response.res400(res, "user is not logged in.")

  const { academicYearId } = req.query;

  try {
    const getFiveAcademicYear = await getLatestFiveAcademicYear()
    let academicYearSelected = null

    if (academicYearId) academicYearSelected = getFiveAcademicYear.find(academic => academic.id === academicYearId)
    else academicYearSelected = getFiveAcademicYear.find(academic => academic.status === "ACTIVE")

    const findEnrollment = await getAllEnrolledTeacherClassByAcademicYear(academicYearSelected.id, user.userId)

    return response.res200(res, "000", "Berhasil mendapatkan kelas terdaftar", {
      listAcademicYear: getFiveAcademicYear,
      enrollmentTeacherClass: findEnrollment
    })
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}

exports.getInitialDataInCourseDetail = async (req, res, next) => {
  const { user } = req
  if (!user) return response.res400(res, "user is not logged in.")

  const { classId, courseId, academicYearId } = req.query
  if (!courseId || !classId || !academicYearId) return response.res400(res, "courseId, classId & academicYearId is required.")

  try {
    const courseDetail = await getInitialCourseDetailById({ id: courseId })
    const classDetail = await checkSchoolClassStatus(classId)
    const academicYear = await getDetailAcademicYear({ academicYearId })

    return response.res200(res, "000", "Sukses mendapatkan initial data untuk detail kelas.", {
      course: courseDetail,
      class: classDetail,
      academicYear: academicYear
    })
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}

exports.getCourseClassDetailTeacher = async (req, res, next) => {
  const { user } = req
  if (!user) return response.res400(res, "user is not logged in.")

  const { courseId, classId } = req.query;
  if (!courseId || !classId) return response.res400(res, "courseId & classId is required.")

  try {
    const getDetailCourse = await getCourseDetailById({ id: courseId });
    if (getDetailCourse.length < 1) return response.res200(res, "001", "Pelajaran tidak terdaftar")

    const courseSections = getDetailCourse.course_sections.map((section) => {
      const filteredModule = section.course_modules.filter(module => module.type === "MODULE")?.sort((a, b) => a.numberModule - b.numberModule)
      const filteredSupportedMaterial = section.course_modules.filter(module => module.type === "SUPPORTED_MATERIAL")?.sort((a, b) => a.numberModule - b.numberModule)

      delete section.course_modules
      return {
        ...section,
        modules: filteredModule,
        supportedMaterial: filteredSupportedMaterial
      }
    }).sort((a, b) => a.numberSection - b.numberSection)

    delete getDetailCourse.course_sections
    
    getDetailCourse.courseSections = courseSections
    return response.res200(res, "000", "Sukses mendapatkan data pelajaran.", courseSections)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}

exports.getCourseSectionsAndModules = async (req, res, next) => {
  const { user } = req
  if (!user) return response.res400(res, "user is not logged in.")

  const { courseId } = req.query;
  if (!courseId) return response.res400(res, "courseId & classId is required.")

  try {
    const getCourseSections = await getCourseSectionsAndModules({ courseId })
    if (getCourseSections.length < 1) return response.res200(res, "001", "Pelajaran tidak terdaftar")

    const courseSections = getCourseSections.map((section) => {
      const filteredModule = section.course_modules.filter(module => module.type === "MODULE")?.sort((a, b) => a.numberModule - b.numberModule)
      const filteredSupportedMaterial = section.course_modules.filter(module => module.type === "SUPPORTED_MATERIAL")?.sort((a, b) => a.numberModule - b.numberModule)

      delete section.course_modules
      return {
        ...section,
        modules: filteredModule,
        supportedMaterial: filteredSupportedMaterial
      }
    }).sort((a, b) => a.numberSection - b.numberSection)
    
    return response.res200(res, "000", "Sukses mendapatkan data pelajaran.", courseSections)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}
