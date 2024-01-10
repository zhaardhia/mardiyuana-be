const apicache = require("apicache");
const cache = apicache.middleware;
const response = require("../../components/response");
// const validator = require("../../middlewares/validator");
const { verifyTokenParent } = require("../../middleware/token")
const express = require("express");
const router = express.Router();

const courseController = require("../../controllers/course");
const reminderCourseController = require("../../controllers/reminderCourse");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/")
  .get(verifyTokenParent, (req, res, next) => {
    courseController.getListCourseStudent(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })

router.route("/initial-data")
  .get(verifyTokenParent, (req, res, next) => {
    courseController.getInitialDataInCourseDetail(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })
router.route("/detail")
  .get(verifyTokenParent, (req, res, next) => {
    courseController.getCourseDetailSession(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })

router.route("/reminder-courses")
  .get(verifyTokenParent, (req, res, next) => {
    reminderCourseController.getAllReminderCourse(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/reminder-course")
  .get(verifyTokenParent, (req, res, next) => {
    reminderCourseController.getDetailReminderCourse(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })


router.all("*", index);

module.exports = router;
