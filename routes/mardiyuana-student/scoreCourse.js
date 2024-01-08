const apicache = require("apicache");
const cache = apicache.middleware;
const response = require("../../components/response");
const { body, param, query, validationResult } = require("express-validator");
// const validator = require("../../middlewares/validator");
const { verifyTokenStudent } = require("../../middleware/token")
const express = require("express");
const router = express.Router();

const scoreCourseController = require("../../controllers/scoreCourse");
const scoreStudentController = require("../../controllers/scoreStudent");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/")
  .get(verifyTokenStudent, (req, res, next) => {
    scoreCourseController.getAllScoreCourseWithScore(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/detail")
  .get(verifyTokenStudent, (req, res, next) => {
    scoreCourseController.getDetailScoreCourse(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/score-course-student")
  .get(verifyTokenStudent, (req, res, next) => {
    scoreStudentController.getStudentScoreData(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.all("*", index);

module.exports = router;
