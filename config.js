const { MongoClient } = require("mongodb");
require('dotenv').config();

let client = null;

async function connectDb() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MongoDB connection string is not defined.");
    }

    if (!client) {
      client = new MongoClient(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      await client.connect();
      console.log("Connected to MongoDB");
    }

    return client.db("zen_Ticketing");
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
}

async function closeConnection() {
  if (client) {
    try {
      await client.close();
      console.log("Connection to MongoDB closed");
    } catch (error) {
      console.error("Error closing connection:", error);
    }
  }
}

module.exports = { connectDb, closeConnection };
