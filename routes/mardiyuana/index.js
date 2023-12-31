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

// router.all('/', index);
router.use("/test", require("./test"));
router.use("/admin", require("./admin"));
router.use("/enrollment-student", require("./enrollment-student"))
router.use("/enrollment-teacher", require("./enrollment-teacher"))
router.use("/curriculum", require("./curriculum"));
router.use("/course", require("./course"));
router.use("/course-section", require("./course-section"));
router.use("/course-module", require("./course-module"));
router.use("/admin-student", require("./admin-student"));
router.use("/admin-teacher", require("./admin-teacher"));
router.use("/event", require("./event"));
router.use("/announcement", require("./announcement"));
router.use("/academic-year", require("./academic-year"));

router.all('*', index);

module.exports = router;
