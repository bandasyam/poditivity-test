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

async function sendConnectionRequest(req, res, next) {
  try {
    const userId = req.user.id;
    const connectionSentToUserId = req.body.connectionSentToUserId;

    // user cannot send request to himself
    if (userId == connectionSentToUserId) {
      return next(createError(400, "you cannot send request to yourself"));
    }

    // check if the user whom are sending request exists
    var isUser = await db.query("SELECT * FROM users where id = $1", [connectionSentToUserId]);
    if (!isUser.rows.length) {
      return next(createError(404, "The user you are trying to send request not found"));
    }

    // check if user has already sent the request
    var isRequestSent = await db.query("SELECT * FROM connections where (sentby = $1 and sentto = $2) OR (sentby = $3 and sentto = $4)", [
      userId,
      connectionSentToUserId,
      connectionSentToUserId,
      userId,
    ]);
    if (isRequestSent.rows.length) {
      return next(createError(409, "you already sent request to this user or the user has already tried to send request"));
    }

    // insert a connection request
    var result = await db.query("INSERT INTO connections (sentby, sentto, timestamp, accepted) VALUES ($1, $2, $3, $4)", [userId, connectionSentToUserId, parseInt(Date.now() / 1000), false]);
    console.log(result.rowCount);
    if (!result.rowCount) {
      return next(createError("couldn't send request"));
    }

    res.status(201).send({ message: "request sent", acknowledged: true, dataInserted: result.rowCount });
  } catch (e) {
    next(e);
  }
}

async function getUserConnectionRequests(req, res, next) {
  try {
    const userId = req.user.id;

    // get all the requests the particular token validated user got
    var result = await db.query("SELECT * FROM  connections where sentto = $1 AND accepted = FALSE", [userId]);
    res.status(200).send(result.rows);
  } catch (e) {
    console.log(e);
    next(e);
  }
}

async function acceptRequest(req, res, next) {
  try {
    const userId = req.user.id;
    const connectionId = req.params.id;

    // check if connection exists
    var connection = await db.query("SELECT * FROM connections where id = $1", [connectionId]);
    if (!connection.rows.length) {
      return next(createError(404, "No connection found with the given id"));
    }

    connection = connection.rows[0];
    console.log(connection);

    // check if user has the permission to accept request
    if (connection.sentto != userId) {
      return next(createError(400, `you don't permission to accept this connection`));
    }

    // make accepted to true
    var acceptRequest = await db.query("update connections set accepted = true where id = $1", [connectionId]);
    console.log(acceptRequest);
    if (!acceptRequest.rowCount) {
      return next(createError(`couldn't accept request`));
    }

    res.status(200).send({ message: "request accepted", acknowledged: true, updatedCount: acceptRequest.rowCount });
  } catch (e) {
    next(e);
  }
}

async function getConnections(req, res, next) {
  try {
    const userId = req.user.id;

    var connections = await db.query("SELECT * from connections where (accepted = true) AND (sentby = $1 OR sentto = $2)", [userId, userId]);
    res.status(200).send(connections.rows);
  } catch (e) {
    next(e);
  }
}

async function getMessagesFromConnection(req, res, next) {
  try {
    const userId = req.user.id;
    const connectionId = req.params.id;

    var messages = await db.query("select * from messages where connection id = $1", [connectionId]);
    res.status(200).send(messages.rows);
  } catch (e) {
    next(e);
  }
}

module.exports = { getUsers, signup, login, getUserConnectionRequests, sendConnectionRequest, acceptRequest, getConnections, getMessagesFromConnection };
