const { Client } = require("pg");

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
