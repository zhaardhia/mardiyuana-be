const apicache = require("apicache");
const cache = apicache.middleware;
const response = require("../../components/response");
const { body, param, query, validationResult } = require("express-validator");
// const validator = require("../../middlewares/validator");
const { verifyTokenTeacher } = require("../../middleware/token")
const express = require("express");
const router = express.Router();

const scoreCourseController = require("../../controllers/scoreCourse");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/")
  .post(verifyTokenTeacher, (req, res, next) => {
    scoreCourseController.insertUpdateScoreCourse(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })
  .get(verifyTokenTeacher, (req, res, next) => {
    scoreCourseController.getAllScoreCourseInTeacher(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/detail")
  .get(verifyTokenTeacher, (req, res, next) => {
    scoreCourseController.getDetailScoreCourse(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/score-course-student")
  .get(verifyTokenTeacher, (req, res, next) => {
    scoreCourseController.getListScoreCourseStudent(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })
  .put(verifyTokenTeacher, (req, res, next) => {
    scoreCourseController.editScoreCourseStudent(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })
  
  // .post(verifyTokenTeacher, (req, res, next) => {
  //   teacherNoteController.insertUpdateTeacherNote(req, res).catch((error) => {
  //     console.error(error);
  //     return response.res500(res, "Internal system error, please try again later!");
  //   });
  //   // return response.res200(res, "000", "sukses bang")
  // })


router.all("*", index);

module.exports = router;
