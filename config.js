var mongodb = require("mongodb");
var mongoClient = mongodb.MongoClient;
let connection;
let db;

//Connect DataBase
async function connectDb() {
  let connection = await mongoClient.connect(process.env.DB);//mongodb://localhost:27017
  let db = connection.db("zen_Ticketing");
  return db;
}

async function closeConnection() {
  if (connection) {
    await connection.close();
  } else {
    console.log("No connection");
  }
}

module.exports = { connectDb, connection, db, closeConnection };
