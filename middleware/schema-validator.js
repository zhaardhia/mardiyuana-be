module.exports.INSERT_ENROLLMENT_STUDENT = {
  id: { type: "string", min: 30, max: 40, optional: true },
  studentId: { type: "string", min: 30, max: 40 },
  classId: { type: "string", min: 30, max: 40 },
  academicYearId: { type: "string", min: 30, max: 40 },
};

module.exports.INSERT_ENROLLMENT_TEACHER = {
  teacherId: { type: "string", min: 30, max: 40 },
  academicYearId: { type: "string", min: 30, max: 40 },
  classIds: { type: 'array', items: 'string', optional: true },
  courseId: { type: "string", min: 30, max: 40, optional: true },
  isHomeRoom : { type: "boolean", min: 30, max: 40, optional: true },
  homeRoomClassId: { type: "string", min: 30, max: 40, optional: true },
};

module.exports.INSERT_COURSE_SECTION = {
  id: { type: "string", min: 30, max: 40, optional: true }, 
  courseId: { type: "string", min: 30, max: 40 }, 
  numberSection: { type: 'number', positive: true, integer: true }, 
  name: { type: "string", min: 10, max: 100 }
}

module.exports.INSERT_COURSE_MODULE = {
  id: { type: "string", min: 30, max: 40, optional: true }, 
  courseSectionId: { type: "string", min: 30, max: 40 }, 
  courseId: { type: "string", min: 30, max: 40 }, 
  numberModule: { type: 'number', positive: true, integer: true }, 
  content: { type: "string", min: 5, max: 1000 },
  url: { type: "string", min: 5, max: 255, optional: true },
  isSupportedMaterial: { type: "boolean" }
}

// STUDENT
module.exports.GET_LIST_STUDENT_TABLE_ADMIN = {
  page: { type: 'number', positive: true, integer: true },
  pageSize: { type: 'number', positive: true, integer: true },
  studentName: { type: "string", min: 0, optional: true }, 
  filterBy: { type: "string", min: 0, optional: true }, 
}
