const apicache = require("apicache");
const cache = apicache.middleware;
const response = require("../../components/response");
const { body, param, query, validationResult } = require("express-validator");
// const validator = require("../../middlewares/validator");
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


router.all("*", index);

module.exports = router;
