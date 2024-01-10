const response = require("../../components/response");
const { verifyTokenParent } = require("../../middleware/token")
const express = require("express");
const router = express.Router();

const schoolClassController = require("../../controllers/schoolClass");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/classmates")
  .get(verifyTokenParent, (req, res, next) => {
    schoolClassController.listAllClassmates(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })

router.all("*", index);

module.exports = router;
