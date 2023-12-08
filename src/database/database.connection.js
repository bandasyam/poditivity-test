const { Client } = require("pg");

// I am considering all the required database and required are created
// while insert data functions like signup or requests we can do is if not table and then create

const db = new Client({
  user: "postgres",
  host: "localhost",
  database: "poditivity-test",
  password: "password",
  port: "5432",
});

async function connectDb() {
  try {
    await db.connect();
    console.log("successfully connect to db");
  } catch (e) {
    console.log("connection failed", e);
    throw e;
  }
}

module.exports = { db, connectDb };
