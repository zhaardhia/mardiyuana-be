const response = require("../../components/response");
const { verifyTokenParent } = require("../../middleware/token")
const express = require("express");
const router = express.Router();

const teacherNoteController = require("../../controllers/teacherNote");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/")
  .get(verifyTokenParent, (req, res, next) => {
    teacherNoteController.getAllTeacherNotesParentSide(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
  })


router.all("*", index);

module.exports = router;
