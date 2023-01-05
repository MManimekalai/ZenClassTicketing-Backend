var express = require("express");
const { connectDb, closeConnection } = require("../../config");
const { authenticate } = require("../../lib/authorize");
var router = express.Router();
const mongodb = require("mongodb");

/* List All  Query Details for Admin. */
router.get("/data", authenticate, async function (req, res, next) {
  // Role based Authentication
  try {
    if (req.role === "ADMIN") {
      const db = await connectDb();
      // Aggregate to combined data with required format from different documents of this collection
      const queryData = await db
        .collection("query")
        .aggregate([
          {
            $lookup: {
              from: "user_data",
              localField: "sId",
              foreignField: "_id",
              as: "result",
            },
          },
          {
            $unwind: "$result",
          },
          {
            $project: {
              _id: "$_id",
              sId: "$sId",
              topic: {
                category: "$topic.category",
                voice_language: "$topic.voice_language",
              },
              details: {
                query_title: "$details.query_title",
                query_description: "$details.query_description",
              },
              time: {
                from: "$time.from",
                till: "$time.till",
              },
              create_date: "$create_date",
              close_date: "$close_date",
              student_data: {
                name: "$result.name",
                course: "$result.course",
                email: "$result.email",
                phone: "$result.phone",
              },
              assigned_mentor: {
                mId: {
                    $toObjectId: "$assigned_mentor.mId",
                  },
                name: "$assigned_mentor.name",
              },
              solution: {
                medium: "$solution.medium",
                description: "$solution.description",
              },
            },
          },
        ])
        .toArray();
        //TO get recent data at first
        const result = queryData.reverse();
      res.json(result);
      await closeConnection();
    } else {
      res.status(401).json({ message: "Unauthorized to get data" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/* List specific Query for Admin. */
router.get("/data/:qId", authenticate, async function (req, res, next) {
  // Role based Authentication
  try {
    if (req.role === "ADMIN") {
      const db = await connectDb();
      // Aggregate to combined data with required format from different documents of this collection
      const queryData = await db
        .collection("query")

        .aggregate([
          {
            $match: {
              _id: mongodb.ObjectId(req.params.qId),
            },
          },
          {
            $lookup: {
              from: "user_data",
              localField: "sId",
              foreignField: "_id",
              as: "result",
            },
          },
          {
            $unwind: "$result",
          },
          {
            $project: {
              _id: "$_id",
              sId: "$sId",
              topic: {
                category: "$topic.category",
                voice_language: "$topic.voice_language",
              },
              details: {
                query_title: "$details.query_title",
                query_description: "$details.query_description",
              },
              time: {
                from: "$time.from",
                till: "$time.till",
              },
              create_date: "$create_date",
              close_date: "$close_date",
              student_data: {
                name: "$result.name",
                course: "$result.course",
                email: "$result.email",
                phone: "$result.phone",
              },
              assigned_mentor: {
                mId: {
                    $toObjectId: "$assigned_mentor.mId",
                  },
                name: "$assigned_mentor.name",
              },
              solution: {
                medium: "$solution.medium",
                description: "$solution.description",
              },
            },
          },
        ])
        .toArray();
      res.json(queryData);
      await closeConnection();
    } else {
      res.status(401).json({ message: "Unauthorized to get data" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/* Assign Mentor to  specific student Query by Admin. */
router.put("/admin_update/:qId", authenticate, async function (req, res, next) {
  // Role based Authentication
  try {
    if (req.role === "ADMIN") {
      const db = await connectDb();
      const findData = await db
        .collection("query")
        .findOne({ _id: mongodb.ObjectId(req.params.qId) });
      if (findData) {
        const assignMentor = await db
          .collection("query")
          .updateOne(
            { _id: mongodb.ObjectId(req.params.qId) },
            { $set: req.body }
          );
        await closeConnection();
        res.json(assignMentor);
      } else {
        res.status(404).json({ message: "Data not Found!" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized to do" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
