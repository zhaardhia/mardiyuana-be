const apicache = require("apicache");
const cache = apicache.middleware;
const response = require("../../components/response");
const { body, param, query, validationResult } = require("express-validator");
// const validator = require("../../middlewares/validator");
const { verifyTokenTeacher } = require("../../middleware/token")
const express = require("express");
const router = express.Router();

const teacherController = require("../../controllers/teacher");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/login")
  .post((req, res, next) => {
    teacherController.login(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })

router.route("/refresh-token")
  .get((req, res, next) => {
    teacherController.refreshTeacherToken(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/edit-password")
  .put(verifyTokenTeacher, (req, res, next) => {
    teacherController.editPasswordTeacher(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/profile-data")
  .get(verifyTokenTeacher, (req, res, next) => {
    teacherController.getProfileData(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/access-change-password")
  .post((req, res, next) => {
    teacherController.sendEmailAddressForgotPass(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/change-password")
  .post((req, res, next) => {
    teacherController.changePasswordForgotPass(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/logout-user")
  .delete(verifyTokenTeacher, (req, res, next) => {
    teacherController.logout(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.all("*", index);

module.exports = router;
