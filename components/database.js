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
const enrollment_student = require("../models/enrollment_student");
const school_class = require("../models/school_class");
const academic_year = require("../models/academic_year");
const curriculum = require("../models/curriculum");
const course = require("../models/course");

module.exports = {
  admin: admin(db, DataTypes),
  teacher: teacher(db, DataTypes),
  parent: parent(db, DataTypes),
  student: student(db, DataTypes),
  enrollment_student: enrollment_student(db, DataTypes),
  school_class: school_class(db, DataTypes),
  academic_year: academic_year(db, DataTypes),
  curriculum: curriculum(db, DataTypes),
  course: course(db, DataTypes),
  db,
};
