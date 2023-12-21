const response = require("../../components/response")
const { db, school_class, academic_year, enrollment_student } = require("../../components/database");
const Validator = require("fastest-validator");
const v = new Validator();
const { INSERT_ENROLLMENT_STUDENT } = require("../../middleware/schema-validator")
const { 
  checkEnrollmentStudentIsRegistered,
  insertEnrollmentStudent
} = require("../query/enrollmentStudent")
const { 
  checkSchoolClassStatus,
} = require("../query/schoolClass")
const { 
  checkAcademicYearIsRegistered,
} = require("../query/academicYear")
const moment = require("moment")

exports.insertEnrollmentStudent = async (req, res, next) => {
  const payloadCheck = await v.compile(INSERT_ENROLLMENT_STUDENT);
  const resPayloadCheck = await payloadCheck(req.body);

  if (resPayloadCheck !== true) {
    return response.res400(res, "Mohon cek kembali kelengkapan data yang telah dikirim.")
  }

  const { studentId, classId, academicYearId } = req.body;

  const checkEnrollmentStudent = await checkEnrollmentStudentIsRegistered(studentId, academicYearId)
  if (checkEnrollmentStudent) return response.res200(res, "001", "Siswa sudah terdaftar pada tahun ajaran ini.")

  const checkAcademicYear = await checkAcademicYearIsRegistered(academicYearId)
  if (!checkAcademicYear) return response.res200(res, "001", `Tahun ajaran belum terdaftar.`)

  const checkClass = await checkSchoolClassStatus(classId)
  if (!checkClass) return response.res200(res, "001", `Kelas belum terdaftar dalam sistem.`)

  try {
    await insertEnrollmentStudent({ 
      studentId,
      classId,
      className: checkClass.name,
      academicYearId,
      academicYear: checkAcademicYear.academicYear
    })
    
    return response.res200(res, "000", `Sukses mendaftarkan siswa ke tahun ajaran ${checkClass.name}`)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Register Gagal. Mohon cek kembali data pendaftaran siswa yang dibuat.")
  }
}
