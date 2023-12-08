const createError = require("http-errors");
const bcrypt = require("bcrypt");
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

async function signup(req, res, next) {
  try {
    const email = req.body.email;

    // check if user already exists with the given email
    var emailExists = await db.query("SELECT * FROM USERS WHERE email=$1", [email]);
    if (emailExists.rows.length) {
      return next(createError(409, `${email} already exists`));
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    req.body.password = hashedPassword;
    var timestamp = parseInt(Date.now() / 1000);

    // insert into database
    var result = await db.query("INSERT INTO USERS (email, password, username, timestamp) VALUES ($1, $2, $3, $4)", [email, hashedPassword, req.body.userName, timestamp]);
    console.log(result.rowCount);

    res.status(201).send({ message: "ok", acknowledged: true, dataInserted: result.rowCount });
  } catch (e) {
    console.log(e);
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const email = req.body.email;

    // check if exists
    var emailExists = await db.query("SELECT * FROM USERS WHERE email=$1", [email]);
    if (!emailExists.rows.length) {
      return next(createError(400, `${email} doesn't exists`));
    }

    // get the data
    var userObject = emailExists.rows[0];

    // compare the hashed password
    const validPassword = await bcrypt.compare(req.body.password, userObject.password);
    if (!validPassword) {
      return next(createError(400, `incorrect password`));
    }

    // send response
    res.status(200).send(userObject);
  } catch (e) {
    next(e);
  }
}

module.exports = { getUsers, signup, login };
