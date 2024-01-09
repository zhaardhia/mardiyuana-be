module.exports.INSERT_ENROLLMENT_STUDENT = {
  id: { type: "string", min: 30, max: 40, optional: true },
  studentId: { type: "string", min: 30, max: 40 },
  classId: { type: "string", min: 30, max: 40 },
  academicYearId: { type: "string", min: 30, max: 40 },
  status: { type: "string", optional: true }
};

module.exports.INSERT_ENROLLMENT_TEACHER = {
  teacherId: { type: "string", min: 30, max: 40 },
  classId: { type: 'string', min: 30, max: 40, optional: true },
  courseValue: { type: "string", min: 3, max: 40, optional: true },
  isHomeRoom : { type: "boolean", min: 30, max: 40, optional: true },
  homeRoomClassId: { type: "string", min: 30, max: 40, optional: true },
};

module.exports.INSERT_COURSE_SECTION = {
  id: { type: "string", min: 30, max: 40, optional: true }, 
  courseId: { type: "string", min: 30, max: 40 }, 
  numberSection: { type: 'number', integer: true, optional: true }, 
  name: { type: "string", min: 10, max: 100 },
  description: { type: "string", min: 10, max: 500 }
}

module.exports.INSERT_COURSE_MODULE = {
  id: { type: "string", min: 30, max: 40, optional: true }, 
  courseSectionId: { type: "string", min: 30, max: 40 }, 
  courseId: { type: "string", min: 30, max: 40 }, 
  numberModule: { type: 'number', integer: true, optional: true }, 
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

// TEACHER
module.exports.GET_LIST_TEACHER_TABLE_ADMIN = {
  page: { type: 'number', positive: true, integer: true },
  pageSize: { type: 'number', positive: true, integer: true },
  teacherName: { type: "string", min: 0, optional: true }, 
  filterBy: { type: "string", min: 0, optional: true }, 
}

// EVENT
module.exports.INSERT_UPDATE_EVENT = {
  id: { type: "string", min: 30, max: 40, optional: true }, 
  name: { type: "string", min: 5, max: 100 }, 
  description: { type: "string", min: 10 }, 
  needVote: { type: "string", min: 2, max: 20 }, 
  imageUrl: { type: "string", min: 5, max: 100, optional: true }, 
}

// EVENT
module.exports.INSERT_UPDATE_ANNOUNCEMENT = {
  id: { type: "string", min: 30, max: 40, optional: true }, 
  title: { type: "string", min: 5, max: 100 }, 
  body: { type: "string", min: 10 }, 
}

// ANNOUNCEMENT
module.exports.GET_LIST_ANNOUNCEMENT_TABLE = {
  page: { type: 'number', positive: true, integer: true },
  pageSize: { type: 'number', positive: true, integer: true },
  searchName: { type: "string", min: 0, optional: true }
}

// REMINDER COURSE
module.exports.INSERT_UPDATE_REMINDER_COURSE = {
  id: { type: "string", min: 30, max: 40, optional: true }, 
  title: { type: "string", min: 5, max: 100 }, 
  body: { type: "string", min: 10 }, 
  academicYearId: { type: "string", min: 30, max: 40 }, 
  courseSectionId: { type: "string", min: 30, max: 40 }, 
  classId: { type: "string", min: 30, max: 40 }, 
}

// HOMEROOM TEACHER PAGE LIST STUDENT 
module.exports.GET_LIST_STUDENT_TABLE_HOMEROOM_TEACHER = {
  page: { type: 'number', positive: true, integer: true },
  pageSize: { type: 'number', positive: true, integer: true },
  studentName: { type: "string", min: 0, optional: true }, 
}

// INSERT UPDATE TEACHER'S NOTE
module.exports.INSERT_UPDATE_TEACHER_NOTE = {
  id: { type: "string", min: 30, max: 40, optional: true },
  title: { type: "string", min: 5, max: 100 }, 
  body: { type: "string", min: 10 }, 
  studentId: { type: "string", min: 30, max: 40 },
  classId: { type: "string", min: 30, max: 40 }, 
}

// INSERT UPDATE SCORE COURSE
module.exports.INSERT_UPDATE_SCORE_COURSE = {
  id: { type: "string", min: 30, max: 40, optional: true },
  title: { type: "string", min: 5, max: 100 }, 
  body: { type: "string", min: 10 }, 
  type: { type: "enum", values: ["ASSIGNMENT", "DAILY_EXAM", "MID_EXAM", "FINAL_EXAM"]},
  classId: { type: "string", min: 30, max: 40 },
  courseId: { type: "string", min: 30, max: 40 },
  scoreDue: { type: "date" },
}

// GET ALL SCORE COURSE
module.exports.GET_ALL_SCORE_COURSE = {
  type: { type: "enum", values: ["ASSIGNMENT", "DAILY_EXAM", "MID_EXAM", "FINAL_EXAM"]},
  // classId: { type: "string", min: 30, max: 40 },
  courseId: { type: "string", min: 30, max: 40 },
  id: { type: "string", min: 30, max: 40 },
  // academicYearId: { type: "string", min: 30, max: 40 },
}

// CHECK STATUS SCORE COURSE STUDENT LIST
module.exports.GET_LIST_SCORE_COURSE_STUDENT = {
  page: { type: 'number', positive: true, integer: true },
  pageSize: { type: 'number', positive: true, integer: true },
  scoreCourseId: { type: "string", min: 30, max: 40 },
}

// EDIT SCORE COURSE STUDENT
module.exports.EDIT_LIST_SCORE_COURSE_STUDENT = {
  scoreCourseStudentId: { type: "string", min: 30, max: 40 },
  score: { type: 'number', integer: true },
  status: { type: "enum", values: ["DONE", "NOT_DONE"]},
}

// CLASSMATE LIST STUDENT 
module.exports.GET_LIST_CLASSMATE = {
  page: { type: 'number', positive: true, integer: true },
  pageSize: { type: 'number', positive: true, integer: true },
  studentName: { type: "string", min: 0, optional: true }, 
}
