const apicache = require("apicache");
const cache = apicache.middleware;
const response = require("../../components/response");
const { body, param, query, validationResult } = require("express-validator");
// const validator = require("../../middlewares/validator");
const { verifyTokenStudent } = require("../../middleware/token")
const express = require("express");
const router = express.Router();

const courseController = require("../../controllers/course");
const reminderCourseController = require("../../controllers/reminderCourse");
const scoreStudentController = require("../../controllers/scoreStudent");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/")
  .get(verifyTokenStudent, (req, res, next) => {
    courseController.getListCourseStudent(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })

router.route("/initial-data")
  .get(verifyTokenStudent, (req, res, next) => {
    courseController.getInitialDataInCourseDetail(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })
router.route("/detail")
  .get(verifyTokenStudent, (req, res, next) => {
    courseController.getCourseDetailSession(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })

router.route("/reminder-courses")
  .get(verifyTokenStudent, (req, res, next) => {
    reminderCourseController.getAllReminderCourse(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/reminder-course")
  .get(verifyTokenStudent, (req, res, next) => {
    reminderCourseController.getDetailReminderCourse(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/score-course")
  .get(verifyTokenStudent, (req, res, next) => {
    scoreStudentController.getStudentScoreData(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.all("*", index);

module.exports = router;
