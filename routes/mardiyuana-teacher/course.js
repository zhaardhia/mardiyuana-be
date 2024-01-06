const apicache = require("apicache");
const cache = apicache.middleware;
const response = require("../../components/response");
const { body, param, query, validationResult } = require("express-validator");
// const validator = require("../../middlewares/validator");
const { verifyTokenTeacher } = require("../../middleware/token")
const express = require("express");
const router = express.Router();

const enrollmentController = require("../../controllers/enrollmentTeacher");
const reminderCourseController = require("../../controllers/reminderCourse");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/initial-data")
  .get(verifyTokenTeacher, (req, res, next) => {
    enrollmentController.getInitialDataInCourseDetail(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/sections-and-modules")
  .get(verifyTokenTeacher, (req, res, next) => {
    enrollmentController.getCourseSectionsAndModules(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/detail")
  .get(verifyTokenTeacher, (req, res, next) => {
    enrollmentController.getCourseClassDetailTeacher(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/reminder-courses")
  .get(verifyTokenTeacher, (req, res, next) => {
    reminderCourseController.getAllReminderCourse(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })

router.route("/reminder-course")
  .get(verifyTokenTeacher, (req, res, next) => {
    reminderCourseController.getDetailReminderCourse(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })
  .post(verifyTokenTeacher, (req, res, next) => {
    reminderCourseController.insertUpdateReminderCourse(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })


router.all("*", index);

module.exports = router;
