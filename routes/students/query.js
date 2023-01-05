var express = require("express");
const mongodb = require("mongodb");
const { connectDb, closeConnection } = require("../../config");
const { authenticate } = require("../../lib/authorize");
var router = express.Router();

/* Query create by student. */
router.post("/create/:sId", authenticate, async function (req, res, next) {
  // Role based Authentication, only the student would create Query
  try {
    if (req.role === "STUDENT") {
      const db = await connectDb();
      const d = new Date();
      req.body.create_date = d.toLocaleString("en-IN");//create date
      const query = await db
        .collection("query")
        .insertOne({ sId: mongodb.ObjectId(req.params.sId), ...req.body });
      await closeConnection();
      res.json({
        message: "Query created, Our Team will connect with you soon...",
      });
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/* Query List for student. */
router.get("/data/:sId", authenticate, async function (req, res) {
  // Role based Authentication
  try {
    if (req.role === "STUDENT") {
      const db = await connectDb();
      const queryData = await db
        .collection("query")
        .find({ sId: mongodb.ObjectId(req.params.sId) })
        .toArray();
      let result = queryData.reverse();

      await closeConnection();
      res.json(result);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/* View one Query in details for student. */
router.get("/data/:sId/:_id", authenticate, async function (req, res) {
  // Role based Authentication
  try {
    if (req.role === "STUDENT") {
      const db = await connectDb();
      const queryData = await db
        .collection("query")
        .find({
          $and: [
            { _id: mongodb.ObjectId(req.params._id) },
            { sId: mongodb.ObjectId(req.params.sId) },
          ],
        })
        .toArray();
      await closeConnection();
      res.json(queryData);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
