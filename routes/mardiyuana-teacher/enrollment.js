const apicache = require("apicache");
const cache = apicache.middleware;
const response = require("../../components/response");
const { body, param, query, validationResult } = require("express-validator");
// const validator = require("../../middlewares/validator");
const { verifyTokenTeacher } = require("../../middleware/token")
const express = require("express");
const router = express.Router();

const enrollmentController = require("../../controllers/enrollmentTeacher");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/class")
  .get(verifyTokenTeacher, (req, res, next) => {
    enrollmentController.getAllEnrolledClass(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })

// router.route("/refresh-token")
//   .get((req, res, next) => {
//     teacherController.refreshTeacherToken(req, res).catch((error) => {
//       console.error(error);
//       return response.res500(res, "Internal system error, please try again later!");
//     });
//   })


router.all("*", index);

module.exports = router;
