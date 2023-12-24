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
