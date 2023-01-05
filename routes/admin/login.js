var express = require("express");
const { connectDb, closeConnection } = require("../../config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var router = express.Router();

/* Admin Registration.*/

// router.post("/register", async function (req, res, next) {
//   try {
//     const db = await connectDb();

//     //Admin login credential
//     let adminCredential = {
//       email: "admin@gmail.com",
//       password: "Admin123",
//     };

//     const salt = await bcrypt.genSalt(10);
//     const hash = await bcrypt.hash(adminCredential.password, salt);
//     const user = db.collection("user_data").insertOne({
//       email: adminCredential.email,
//       password: hash,
//       role: "ADMIN",
//     });
//     await closeConnection();
//     res.json({ message: "Admin created" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Something went wrong" });
//   }
// });

/* Common Login for All.*/
router.post("/", async function (req, res, next) {
  try {
    const db = await connectDb();
    const user = await db
      .collection("user_data")
      .findOne({ email: req.body.email });
    // Compare login credential and create JWT for Authentication
    if (user) {
      const compare = await bcrypt.compare(req.body.password, user.password);
      if (compare) {
        const token = jwt.sign(
          { _id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );
        res.json({ token: token, role:user.role,uId:user._id });
        
      } else {
        res.status(404).json({ message: "Incorrect Email/Password" });
      }
    } else {
      res.status(404).json({ message: "Incorrect Email/Password" });
    }
    await closeConnection();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
