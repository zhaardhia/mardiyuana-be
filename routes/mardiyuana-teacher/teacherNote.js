const apicache = require("apicache");
const cache = apicache.middleware;
const response = require("../../components/response");
const { body, param, query, validationResult } = require("express-validator");
// const validator = require("../../middlewares/validator");
const { verifyTokenTeacher } = require("../../middleware/token")
const express = require("express");
const router = express.Router();

const teacherNoteController = require("../../controllers/teacherNote");

const index = function (req, res, next) {
  response.res404(res);
};

router.route("/")
  .get(verifyTokenTeacher, (req, res, next) => {
    teacherNoteController.getAllTeacherNotes(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })
  .post(verifyTokenTeacher, (req, res, next) => {
    teacherNoteController.insertUpdateTeacherNote(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })
  .delete(verifyTokenTeacher, (req, res, next) => {
    teacherNoteController.deleteTeacherNotes(req, res).catch((error) => {
      console.error(error);
      return response.res500(res, "Internal system error, please try again later!");
    });
    // return response.res200(res, "000", "sukses bang")
  })


router.all("*", index);

module.exports = router;
