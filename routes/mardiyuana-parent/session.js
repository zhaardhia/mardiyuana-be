const apicache = require("apicache");
const cache = apicache.middleware;
const response = require("../../components/response");
const { body, param, query, validationResult } = require("express-validator");
const { verifyTokenParent } = require("../../middleware/token");
// const verifyToken = require("../../middlewares/verifyToken")
const express = require("express");
const router = express.Router();

const parentController = require("../../controllers/parent");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/login")
  .post((req, res, next) => {
    parentController.login(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })

router.route("/refresh-token")
  .get((req, res, next) => {
    parentController.refreshParentToken(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/edit-password")
  .put(verifyTokenParent, (req, res, next) => {
    parentController.editPasswordParent(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/profile-data")
  .get(verifyTokenParent, (req, res, next) => {
    parentController.getProfileData(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/access-change-password")
  .post((req, res, next) => {
    parentController.sendEmailAddressForgotPass(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/change-password")
  .post((req, res, next) => {
    parentController.changePasswordForgotPass(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.all("*", index);

module.exports = router;
