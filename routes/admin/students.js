var express = require("express");
const { connectDb, closeConnection } = require("../../config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticate } = require("../../lib/authorize");
var router = express.Router();

/* Student Registration by Admin.*/
router.post("/register", authenticate, async function (req, res, next) {
  // Role based Authentication
  try {
    if (req.role === "ADMIN") {
      const db = await connectDb();
      const studentData = await db
        .collection("user_data")//for students
        .findOne({ email: req.body.email });

      if (!studentData) {
        //Hash the password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;
        req.body.role = "STUDENT";
        const student = db.collection("user_data").insertOne(req.body);
        await closeConnection();
        res.json({ message: "Student Added" });
      } else {
        res.status(404).json({ message: "This Email Id already Exist" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized to do!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/* Get All Students Data for Admin.*/
router.get("/data", authenticate, async function (req, res, next) {
  // Role based Authentication
  try {
    if (req.role === "ADMIN") {
      const db = await connectDb();
      //Get only students from user_data collection
      const mentors = await db.collection("user_data").find({role:"STUDENT"}).toArray();
      res.json(mentors);
      await closeConnection();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
