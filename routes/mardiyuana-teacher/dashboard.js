const apicache = require("apicache");
const cache = apicache.middleware;
const response = require("../../components/response");
const { body, param, query, validationResult } = require("express-validator");
// const validator = require("../../middlewares/validator");
// const verifyToken = require("../../middlewares/verifyToken")
const express = require("express");
const router = express.Router();

const dashboardControler = require("../../controllers/dashboard");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/")
  .get((req, res, next) => {
    dashboardControler.getDashboardStudentData(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })
router.route("/event-detail")
  .get((req, res, next) => {
    dashboardControler.getDashboardEventDetai(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })

router.route("/announcement-list")
  .get((req, res, next) => {
    dashboardControler.getListAnnouncement(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })

router.route("/announcement-detail")
  .get((req, res, next) => {
    dashboardControler.detailAnnouncement(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })
router.all("*", index);

module.exports = router;
