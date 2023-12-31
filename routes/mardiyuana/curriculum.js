const apicache = require("apicache");
const cache = apicache.middleware;
const response = require("../../components/response");
const { body, param, query, validationResult } = require("express-validator");
// const validator = require("../../middlewares/validator");
const { verifyToken } = require("../../middleware/token")
const express = require("express");
const router = express.Router();

const curriculumController = require("../../controllers/curriculum");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/")
  .post((req, res, next) => {
    curriculumController.insertUpdateCurriculum(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })
  .get(verifyToken, (req, res, next) => {
    curriculumController.getAllCurriculum(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/activate")
  .put((req, res, next) => {
    curriculumController.activateCurriculum(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.all("*", index);

module.exports = router;
