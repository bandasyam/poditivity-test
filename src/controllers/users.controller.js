const { db } = require("../database/database.connection");

async function getUsers(req, res, next) {
  try {
    const result = await db.query("SELECT * FROM USERS");
    res.status(200).send(result.rows);
  } catch (e) {
    console.log("in catch e", e);
    next(e);
  }
}

module.exports = { getUsers };
