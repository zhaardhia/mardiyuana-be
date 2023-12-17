"use strict";
const { Sequelize, DataTypes } = require("sequelize");
const { DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT } = process.env;

const db = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "mysql",
  timezone: "+07:00",
  logging: false,
  define: {
    freezeTableName: true,
    timestamps: false,
  },
});

db.authenticate()
  .then(() => console.log(`Connected to database : ${DB_HOST}:${DB_PORT}`))
  .catch(() => console.error(`Unable to connect to the database!`));

const admin = require("../models/admin");
const teacher = require("../models/teacher");
const parent = require("../models/parent");
const student = require("../models/student");

module.exports = {
  admin: admin(db, DataTypes),
  teacher: teacher(db, DataTypes),
  parent: parent(db, DataTypes),
  student: student(db, DataTypes),
  db,
};
