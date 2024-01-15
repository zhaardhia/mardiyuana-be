const apicache = require("apicache");
const cache = apicache.middleware;
const response = require("../../components/response");
const { body, param, query, validationResult } = require("express-validator");
// const validator = require("../../middlewares/validator");
// const verifyToken = require("../../middlewares/verifyToken")
const express = require("express");
const router = express.Router();

const studentController = require("../../controllers/student");
const { verifyTokenStudent } = require("../../middleware/token");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/login")
  .post((req, res, next) => {
    studentController.login(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })

router.route("/refresh-token")
  .get((req, res, next) => {
    studentController.refreshStudentToken(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/edit-password")
  .put(verifyTokenStudent, (req, res, next) => {
    studentController.editPasswordStudent(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/profile-data")
  .get(verifyTokenStudent, (req, res, next) => {
    studentController.getProfileData(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/access-change-password")
  .post((req, res, next) => {
    studentController.sendEmailAddressForgotPass(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/change-password")
  .post((req, res, next) => {
    studentController.changePasswordForgotPass(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })


router.all("*", index);

module.exports = router;
