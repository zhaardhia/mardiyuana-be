const response = require("../../components/response")
const { db, school_class, academic_year, enrollment_student } = require("../../components/database");
const Validator = require("fastest-validator");
const v = new Validator();
const { INSERT_ENROLLMENT_STUDENT } = require("../../middleware/schema-validator")
const { 
  checkEnrollmentStudentIsRegistered,
  insertEnrollmentStudent,
  updateClassOrAcademicYearEnrollmentStudent,
  getLastEnrollmentStudentGraduate
} = require("../query/enrollmentStudent")
const { 
  checkSchoolClassStatus,
  getAllClassWithGrade,
} = require("../query/schoolClass")
const { 
  checkAcademicYearIsRegistered,
  checkAcademicYearThatActive
} = require("../query/academicYear")
const { 
  checkExistingStudent
} = require("../query/student")
const moment = require("moment")

exports.insertUpdateEnrollmentStudent = async (req, res, next) => {
  const payloadCheck = await v.compile(INSERT_ENROLLMENT_STUDENT);
  const resPayloadCheck = await payloadCheck(req.body);

  if (resPayloadCheck !== true) {
    return response.res400(res, "Mohon cek kembali kelengkapan data yang telah dikirim.")
  }

  try {
    const { id, studentId, classId, academicYearId, status } = req.body;
    
    if (!id) {
      const checkEnrollmentStudent = await checkEnrollmentStudentIsRegistered(studentId, academicYearId)
      if (checkEnrollmentStudent) return response.res200(res, "001", "Siswa sudah terdaftar pada tahun ajaran ini.")
    }

    const checkAcademicYear = await checkAcademicYearIsRegistered(academicYearId)
    if (!checkAcademicYear) return response.res200(res, "001", `Tahun ajaran belum terdaftar.`)

    const checkClass = await checkSchoolClassStatus(classId)
    if (!checkClass) return response.res200(res, "001", `Kelas belum terdaftar dalam sistem.`)

    if (id) {
      await updateClassOrAcademicYearEnrollmentStudent({ 
        id,
        classId,
        className: checkClass.name,
        academicYearId,
        academicYear: checkAcademicYear.academicYear,
        status
      })
      
      return response.res200(res, "000", `Sukses mengubah data siswa ke tahun ajaran ${checkAcademicYear.academicYear}`)
    }

    await insertEnrollmentStudent({ 
      studentId,
      classId,
      className: checkClass.name,
      academicYearId,
      academicYear: checkAcademicYear.academicYear
    })
    
    return response.res200(res, "000", `Sukses mendaftarkan siswa ke tahun ajaran ${checkAcademicYear.academicYear}`)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Register Gagal. Mohon cek kembali data pendaftaran siswa yang dibuat.")
  }
}

exports.getSupportedDataToInsertEnrollStudent = async (req, res, next) => {
  const { id, studentId } = req.query;
  if (!studentId) return response.res400(res, "studentId is required.");

  const checkStudent = await checkExistingStudent(studentId)
  console.log({checkStudent})
  if (!checkStudent) return response.res400(res, "Murid tidak aktif.")

  let nextGrade = null
  const getLastEnrollmentGraduate = await getLastEnrollmentStudentGraduate({ studentId })
  if (getLastEnrollmentGraduate && getLastEnrollmentGraduate.status === "ACTIVE") {
    return response.res400(res, "Murid belum menyelesaikan tahun ajaran sebelumnya.")
  }

  if (!getLastEnrollmentGraduate) nextGrade = 7 // smp starts with grade 7
  else nextGrade = Number(getLastEnrollmentGraduate.className.charAt(0)) + (id ? 0 : 1)
  // console.log({getLastEnrollmentGraduate})
  const getAllClassPossibleWithGrade = await getAllClassWithGrade(nextGrade);
  if (!getAllClassPossibleWithGrade) return response.res400(res, "Tidak ada kelas aktif.")

  const getActiveAcademicYear = await checkAcademicYearThatActive()
  if (!getActiveAcademicYear) return response.res400(res, "Tidak ada tahun ajaran aktif.")

  if (getLastEnrollmentGraduate && getActiveAcademicYear.id === getLastEnrollmentGraduate.academicYearId) {
    return response.res200(res, "001", "Belum ada tahun ajaran aktif terbaru.")
  }

  return response.res200(res, "000", "Sukses mendapatkan initial data untuk enroll murid", {
    classes: getAllClassPossibleWithGrade,
    activeAcademicYear: getActiveAcademicYear
  })
}
