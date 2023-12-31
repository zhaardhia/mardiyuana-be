const apicache = require("apicache");
const cache = apicache.middleware;
const response = require("../../components/response");
const { body, param, query, validationResult } = require("express-validator");
// const validator = require("../../middlewares/validator");
// const verifyToken = require("../../middlewares/verifyToken")
const express = require("express");
const router = express.Router();

const teacherController = require("../../controllers/teacher");

const index = function (req, res, next) {
  response.res404(res);
};


router.route("/list-teacher-table")
  .get((req, res, next) => {
    teacherController.listTableStudentAdmin(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/edit-teacher")
  .put((req, res, next) => {
    teacherController.editTeacher(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/detail-teacher")
  .get((req, res, next) => {
    teacherController.getDetailTeacherAdmin(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.all("*", index);

module.exports = router;
