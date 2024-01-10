const express = require("express");
const response = require("../../components/response");
const router = express.Router();

const index = function (req, res, next) {
  response.res404(res);
};

router.all("/", index);
router.all("/connect", (req, res, next) => {
  response.res200(res, '000', 'Connection Established')
});

router.all('/', index);
router.use("/session", require("./session"));
router.use("/course", require("./course"));
router.use("/score-course", require("./scoreCourse"));
router.use("/school-class", require("./schoolClass"));
router.use("/teacher-note", require("./teacherNote"));

router.all('*', index);

module.exports = router;
