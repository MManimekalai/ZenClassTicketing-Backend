var express = require("express");
const { connectDb, closeConnection } = require("../../config");
const { authenticate } = require("../../lib/authorize");
var router = express.Router();
const mongodb = require("mongodb");

/* List All Assigned query to the mentor. */
router.get("/all_query/:mId", async function (req, res, next) {
  try {
    const db = await connectDb();
    const findQuery = await db
      .collection("query")
      // .find({ "assigned_mentor.mId": req.params.mId })

      // Aggregate to combined data with required format from different documents of this collection
      .aggregate([
        {
          $match: {
            "assigned_mentor.mId": req.params.mId,
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
    await closeConnection();
    if (findQuery) {
      const result = findQuery.reverse();
      res.json(result);
    } else {
      res.status(404).json({ message: "Query Not Found!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/* List Particular Assigned query to the mentor. */
router.get("/on_query/:mId/:qId",authenticate,async function (req, res, next) {
  // Role based Authentication
    try {
      if (req.role === "MENTOR") {
        const db = await connectDb();
        const findQuery = await db
          .collection("query")
          // .findOne({
          //   $and: [
          //     { "assigned_mentor.mId": req.params.mId },
          //     { _id: mongodb.ObjectId(req.params.qId) },
          //   ],
          // });

          // Aggregate to combined data with required format from different documents of this collection
          .aggregate([
            {
              $match: {
                $and: [
                  {
                    "assigned_mentor.mId": req.params.mId,
                  },
                  {
                    _id: mongodb.ObjectId(req.params.qId),
                  },
                ],
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

        await closeConnection();
        if (findQuery) {
          res.json(findQuery);
        } else {
          res.status(404).json({ message: "Data Not Found!" });
        }
      } else {
        res.status(401).json({ message: "Unauthorized to do" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

/* Resolve the query by mentor and update the status. */
router.put(
  "/resolve_query/:mId/:qId",
  authenticate,
  async function (req, res, next) {
     // Role based Authentication
    try {
      if (req.role === "MENTOR") {
        const db = await connectDb();
        //find one document based on two below condition to resolve & close that query
        const findData = await db.collection("query").findOne({
          $and: [
            { "assigned_mentor.mId": req.params.mId },
            { _id: mongodb.ObjectId(req.params.qId) },
          ],
        });
        if (findData) {
          const d = new Date();
          req.body.close_date = d.toLocaleString("en-IN");//update close date
          const resolve = await db.collection("query").updateOne(
            {
              $and: [
                { "assigned_mentor.mId": req.params.mId },
                { _id: mongodb.ObjectId(req.params.qId) },
              ],
            },
            { $set: req.body }
          );
          await closeConnection();
          res.json(resolve);
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
  }
);
module.exports = router;
