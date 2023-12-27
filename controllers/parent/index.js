"use strict";

const response = require("../../components/response")
const { db, parent } = require("../../components/database");
const { nanoid } = require("nanoid");
const { validationEmail } = require("../../middleware/validator")
// const { forgotPass } = require("../../libs/email")
