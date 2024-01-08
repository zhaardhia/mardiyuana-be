const response = require("../../components/response")
const { db } = require("../../components/database");
const Validator = require("fastest-validator");
const v = new Validator();
const { GET_LIST_CLASSMATE } = require("../../middleware/schema-validator")
const { isString } = require("../../middleware/validator");
const { checkAcademicYearThatActive } = require("../query/academicYear")
const { getActiveEnrollmentStudentByStudentId } = require("../query/enrollmentStudent")
const { getListStudentsInHomeroomPage, totalCountListStudentInHomeroomPage } = require("../query/student")

exports.listAllClassmates = async (req, res, next) => {
  const payload = {
    page: Number(req.query.page) || undefined,
    pageSize: Number(req.query.pageSize) || undefined,
    studentName: req.query.studentName || '',
  }

  const payloadCheck = await v.compile(GET_LIST_CLASSMATE);
  const resPayloadCheck = await payloadCheck(payload);

  if (resPayloadCheck !== true) {
    console.log({resPayloadCheck})
    return response.res400(res, resPayloadCheck[0].message)
  }

  const { user } = req;
  if (!user) return response.res400(res, "user is not logged in.")

  const { page, pageSize, studentName } = payload
  try {
    const getActiveAcademicYear = await checkAcademicYearThatActive()
    const getStudentEnrollment = await getActiveEnrollmentStudentByStudentId({ academicYearId: getActiveAcademicYear.id, studentId: user.userId })

    if (!getStudentEnrollment) return response.res200(res, "001", `Guru belum terdaftar sebagai wali kelas pada tahun ajaran ${getActiveAcademicYear.academicYear}`)
    console.log({getStudentEnrollment})
    const getListStudents = await getListStudentsInHomeroomPage({ 
      page,
      pageSize,
      studentName,
      academicYearId: getActiveAcademicYear.id,
      classId: getStudentEnrollment.classId
    })
    const totalData = await totalCountListStudentInHomeroomPage({
      studentName,
      academicYearId: getActiveAcademicYear.id,
      classId: getStudentEnrollment.classId
    });

    const totalPages = Math.ceil(totalData / pageSize);
    const nextPage = getListStudents.length > pageSize ? page + 1 : null
    // console.log({dataStudent})
    if (getListStudents.length > pageSize) getListStudents.pop();

    const responseData = {
      listStudents: [...getListStudents],
      totalData,
      totalPages,
      nextPage
    }

    return response.res200(res, "000", "Sukses mendapatkan data murid sekelas.", responseData)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}
