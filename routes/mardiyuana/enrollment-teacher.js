const apicache = require("apicache");
const cache = apicache.middleware;
const response = require("../../components/response");
const { body, param, query, validationResult } = require("express-validator");
// const validator = require("../../middlewares/validator");
// const verifyToken = require("../../middlewares/verifyToken")
const express = require("express");
const router = express.Router();

const enrollmentTeacherController = require("../../controllers/enrollmentTeacher");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/insert-enrollment-teacher")
  .post((req, res, next) => {
    enrollmentTeacherController.insertEnrollmentTeacher(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })


router.all("*", index);

module.exports = router;
