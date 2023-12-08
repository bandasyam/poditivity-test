const createError = require("http-errors");
const bcrypt = require("bcrypt");
const { db } = require("../database/database.connection");
const { createToken } = require("../middlewares/tokenValidator.middleware");

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
    if (!result.rowCount) {
      return next(createError("couln't signup"));
    }

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

    // set token in headers
    res.header("token", createToken({ email: userObject.email }));

    // send response
    res.status(200).send(userObject);
  } catch (e) {
    next(e);
  }
}

async function getUserConnectionRequests(req, res, next) {
  try {
    const userId = req.user.id;

    // get all the requests the particular token validated user got
    var result = await db.query("SELECT * FROM  requests where sentto = $1", [userId]);
    res.status(200).send(result.rows);
  } catch (e) {
    console.log(e);
    next(e);
  }
}

async function sendConnectionRequest(req, res, next) {
  try {
    const userId = req.user.id;
    const connectionSentToUserId = req.body.connectionSentToUserId;

    // check if the user whom are sending request exists
    var isUser = await db.query("SELECT * FROM users where id = $1", [connectionSentToUserId]);
    if (!isUser.rows.length) {
      return next(createError(404, "The user you are trying to send request not found"));
    }

    // check if user has already sent the request
    var isRequestSent = await db.query("SELECT * FROM requests where sentby = $1 and sentto = $2", [userId, connectionSentToUserId]);
    if (isRequestSent.rows.length) {
      return next(createError(409, "you already sent request to this user"));
    }

    // insert a connection request
    var result = await db.query("INSERT INTO requests (sentby, sentto, timestamp) VALUES ($1, $2, $3)", [userId, connectionSentToUserId, parseInt(Date.now() / 1000)]);
    console.log(result.rowCount);
    if (!result.rowCount) {
      return next(createError("couldn't send request"));
    }

    res.status(201).send({ message: "ok", acknowledged: true, dataInserted: result.rowCount });
  } catch (e) {
    next(e);
  }
}

module.exports = { getUsers, signup, login, getUserConnectionRequests, sendConnectionRequest };
