const response = require("../../components/response");
const { verifyTokenParent } = require("../../middleware/token")
const express = require("express");
const router = express.Router();

const scoreCourseController = require("../../controllers/scoreCourse");
const scoreStudentController = require("../../controllers/scoreStudent");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/")
  .get(verifyTokenParent, (req, res, next) => {
    scoreCourseController.getAllScoreCourseWithScore(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/detail")
  .get(verifyTokenParent, (req, res, next) => {
    scoreCourseController.getDetailScoreCourse(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/score-course-student")
  .get(verifyTokenParent, (req, res, next) => {
    scoreStudentController.getStudentScoreData(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.all("*", index);

module.exports = router;
