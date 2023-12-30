const apicache = require("apicache");
const cache = apicache.middleware;
const response = require("../../components/response");
const { body, param, query, validationResult } = require("express-validator");
// const validator = require("../../middlewares/validator");
// const verifyToken = require("../../middlewares/verifyToken")
const express = require("express");
const router = express.Router();

const courseModuleController = require("../../controllers/course_module");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/insert-update-course-module")
  .post((req, res, next) => {
    courseModuleController.insertUpdateCourseModule(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/get-all-modules")
  .get((req, res, next) => {
    courseModuleController.getAllCourseModuleByCourseSectionId(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/reorder-module")
  .put((req, res, next) => {
    courseModuleController.reorderCourseModule(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })


router.all("*", index);

module.exports = router;
