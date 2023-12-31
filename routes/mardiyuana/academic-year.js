const apicache = require("apicache");
const cache = apicache.middleware;
const response = require("../../components/response");
// const validator = require("../../middlewares/validator");
const { verifyToken } = require("../../middleware/token")
const express = require("express");
const router = express.Router();

const academicYearController = require("../../controllers/academicYear");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/")
  .post((req, res, next) => {
    academicYearController.insertUpdateAcademicYear(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })
  .get(verifyToken, (req, res, next) => {
    academicYearController.getAllAcademicYear(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.route("/activate")
  .put((req, res, next) => {
    academicYearController.activateAcademicYear(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.all("*", index);

module.exports = router;
