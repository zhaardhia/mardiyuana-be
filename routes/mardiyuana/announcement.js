const apicache = require("apicache");
const cache = apicache.middleware;
const response = require("../../components/response");
// const validator = require("../../middlewares/validator");
// const verifyToken = require("../../middlewares/verifyToken")
const express = require("express");
const router = express.Router();

const announcementController = require("../../controllers/announcement");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/")
  .post((req, res, next) => {
    announcementController.insertUpdateAnnouncement(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })
  .get((req, res, next) => {
    announcementController.getAllAnnouncements(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.all("*", index);

module.exports = router;
