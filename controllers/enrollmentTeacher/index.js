const response = require("../../components/response")
const { db } = require("../../components/database");
const Validator = require("fastest-validator");
const v = new Validator();
const { INSERT_ENROLLMENT_TEACHER } = require("../../middleware/schema-validator")
const { 
  checkEnrollmentTeacherIsRegistered,
  checkEnrollmentTeacherHomeroomIsRegistered,
  insertEnrollmentTeacher
} = require("../query/enrollmentTeacher")
const { 
  checkSchoolClassStatus,
} = require("../query/schoolClass")
const { 
  checkAcademicYearIsRegistered,
} = require("../query/academicYear")
const { 
  checkCourseStatus
} = require("../query/course")
const { 
  checkTeacherFullname
} = require("../query/teacher")
const moment = require("moment")

exports.insertEnrollmentTeacher = async (req, res, next) => {
  const payloadCheck = await v.compile(INSERT_ENROLLMENT_TEACHER);
  const resPayloadCheck = await payloadCheck(req.body);

  if (resPayloadCheck !== true) {
    return response.res400(res, "Mohon cek kembali kelengkapan data yang telah dikirim.")
  }

  try {
    const { teacherId, academicYearId, classIds, courseId, isHomeroom, homeRoomClassId } = req.body;

    const checkTeacher = await checkTeacherFullname(teacherId)
    if (!checkTeacher) return response.res200(res, "001", `Guru belum terdaftar.`)

    const checkAcademicYear = await checkAcademicYearIsRegistered(academicYearId)
    if (!checkAcademicYear) return response.res200(res, "001", `Tahun ajaran belum terdaftar.`)

    if (isHomeroom) {
      const checkClass = await checkSchoolClassStatus(homeRoomClassId)
      if (!checkClass) return response.res200(res, "001", `Kelas belum terdaftar dalam sistem.`)

      const checkEnrollmentTeacher = await checkEnrollmentTeacherHomeroomIsRegistered(teacherId, academicYearId, homeRoomClassId)
      if (checkEnrollmentTeacher) return response.res200(res, "001", "Wali kelas pada kelas tersebut sudah terdaftar pada tahun ajaran ini.")

      await insertEnrollmentTeacher({ 
        teacherId,
        teacherName: checkTeacher.name,
        academicYearId,
        academicYear: checkAcademicYear.academicYear,
        classId: homeRoomClassId,
        className: checkClass.name,
        teacherType: "HOMEROOM",
      })
      return response.res200(res, "000", `Sukses mendaftarkan wali kelas ${checkClass.name} ke tahun ajaran ${checkAcademicYear.name}`)
    }

    const checkCourse = await checkCourseStatus(courseId)
    if (!checkCourse) return response.res200(res, "001", `Pelajaran belum terdaftar.`)

    for (const classId of classIds) {
      const checkClass = await checkSchoolClassStatus(classId)
      if (!checkClass) return response.res200(res, "001", `Kelas belum terdaftar dalam sistem.`)

      const checkEnrollmentTeacher = await checkEnrollmentTeacherIsRegistered(teacherId, academicYearId, classId)
      if (checkEnrollmentTeacher) return response.res200(res, "001", "Guru sudah terdaftar pada tahun ajaran ini.")

      await insertEnrollmentTeacher({ 
        teacherId,
        teacherName: checkTeacher.name,
        academicYearId,
        academicYear: checkAcademicYear.academicYear,
        classId,
        className: checkClass.name,
        courseId,
        courseName: checkCourse.name,
        teacherType: "NORMAL",
      })
    }

    return response.res200(res, "000", `Sukses mendaftarkan guru ke tahun ajaran ${checkAcademicYear.name}`)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Register Gagal. Mohon cek kembali data pendaftaran guru yang dibuat.")
  }
}
