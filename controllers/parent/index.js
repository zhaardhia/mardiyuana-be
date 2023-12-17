"use strict";

const response = require("../../components/response")
const { db, parent } = require("../../components/database");
// const bcrypt = require("bcrypt")
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken")
const { validationEmail } = require("../../middleware/validator")
// const { forgotPass } = require("../../libs/email")
const bcrypt = require("bcryptjs")
