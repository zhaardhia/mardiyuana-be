"use strict";

const response = require("../components/response")
const { db } = require("../components/database")
// const { nanoid } = require('nanoid');
const jwt = require("jsonwebtoken")

exports.testingApi = async (req, res, next) => {
  return response.res200(res, "000", "Berhasil konfigurasi API!");
}

exports.wakwaw = async (req, res, next) => {
  console.log("asu")
  return response.res200(res, "000", "wlelwelwelw", { data: "wkwk" });
}