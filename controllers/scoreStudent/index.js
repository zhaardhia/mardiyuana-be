const response = require("../../components/response")
const { db } = require("../../components/database");
const moment = require("moment");
const { isString } = require("../../middleware/validator");
const { nanoid } = require("nanoid");
const { scoreCourseConstantType } = require("../utils/data")
const { checkCourseStatus, getAllCourse, getCourseByGradeAndCurriculum } = require("../query/course")
const { getAllEnrollmentStudentByStudentId, checkEnrollmentStudentGrade } = require("../query/enrollmentStudent")
const { checkAcademicYearIsRegistered, getDetailAcademicYear, checkAcademicYearThatActive } = require("../query/academicYear")
const { getAllCourseByCurriculumIdAndGrade, getCourseDetailById, getInitialCourseDetailById } = require("../query/course")
const { checkSchoolClassStatus } = require("../query/schoolClass")
const { getAllScoreStudentByType } = require("../query/scoreStudent")

exports.getStudentScoreData = async (req, res, next) => {
  const { user } = req
  const { academicYearId } = req.query

  if (!user) return response.res400(res, "user is not logged in.")
  console.log({user})
  try {
    const getAllEnrollmentStudent = await getAllEnrollmentStudentByStudentId({ studentId: user.userId })
    if (getAllEnrollmentStudent.length < 1) return response.res200(res, "001", "Murid belum didaftarkan ke tahun ajaran.")

    getAllEnrollmentStudent.sort((a, b) => b.createdAt - a.createdAt)
    const optionAcademicYear = getAllEnrollmentStudent.map((enroll) => {
      return { label: enroll.academicYear, value: enroll.academicYearId }
    })

    let curriculumData = null
    let idAcademicYear = null
    if (academicYearId) idAcademicYear = academicYearId
    else {
      const getActiveAcademic = await checkAcademicYearThatActive()
      idAcademicYear = getActiveAcademic.id
    }

    const academicYear = await checkAcademicYearIsRegistered(idAcademicYear)
    if (!academicYear) return response.res400(res, "academicYear is not found.")

    curriculumData = { id: academicYear.curriculumId, name: academicYear.curriculumName }
    const getEnrollSelected = await checkEnrollmentStudentGrade(user.userId, academicYearId)
    if (!getEnrollSelected) return response.res400(res, "enrollment is not found in this academic year.")

    const grade = Number(getEnrollSelected.className.charAt(0))

    // execute get all course score
    const getAllCourse = await getCourseByGradeAndCurriculum({ curriculumId: curriculumData.id, grade })
    const mapScoreCourse = await Promise.all(
      getAllCourse.map( async (course) => {
        const objCourse = {
          ...course
        }
        const scoreCourseByType = []

        for (const type of scoreCourseConstantType) {
          let objScoreType = {}
          const getAllScoreCourse = await getAllScoreStudentByType({
            type,
            academicYearId: idAcademicYear,
            classId: getEnrollSelected.classId,
            courseId: course.id,
            studentId: user.userId
          })

          if (getAllScoreCourse.length < 1) objScoreType.scoreMean = 0
          else if (getAllScoreCourse.length === 1) objScoreType.scoreMean = getAllScoreCourse[0].score
          else {
            const accScore = getAllScoreCourse.reduce((acc, obj) => acc + obj.score, 0)
            objScoreType.scoreMean = accScore > 0 ? accScore / getAllScoreCourse.length : accScore
          }
          
          objScoreType.scoreCourseType = type
          objScoreType.scoreCourseDetail = getAllScoreCourse

          scoreCourseByType.push(objScoreType)
        }

        objCourse.scoreCourseStudentDetail = scoreCourseByType
        return objCourse
      })
    )

    return response.res200(res, "000", "Sukses mendapatkan data nilai - nilai murid.", {
      optionAcademicYear,
      scoreCourseStudent: mapScoreCourse
    })
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}
