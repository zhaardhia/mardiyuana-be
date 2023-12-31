const apicache = require("apicache");
const cache = apicache.middleware;
const response = require("../../components/response");
const { body, param, query, validationResult } = require("express-validator");
// const validator = require("../../middlewares/validator");
// const verifyToken = require("../../middlewares/verifyToken")
const express = require("express");
const router = express.Router();

const courseController = require("../../controllers/course");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/")
  .post((req, res, next) => {
    courseController.insertUpdateCourse(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })
  .get((req, res, next) => {
    courseController.getAllCourse(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })


router.all("*", index);

module.exports = router;
