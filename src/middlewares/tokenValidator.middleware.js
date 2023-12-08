require("dotenv").config();
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const { db } = require("../database/database.connection");

module.exports.createToken = (payload, expiresIn = 60 * 60 * 24 * 7) => {
  return jwt.sign(payload, "jwtsecret", { expiresIn });
};

module.exports.validateToken = async (req, res, next) => {
  try {
    // get the token from headers
    const token = req.headers.token;
    if (!token) {
      return next(createError(401, "No token found"));
    }

    // get the decodedToken
    var decodedToken = decodeToken(token);

    // check if he is a proper user
    var user = await db.query("SELECT * FROM USERS WHERE email=$1", [decodedToken.email]);
    if (!user.rows.length) {
      next(createError(404, "user not found"));
    }

    req.user = user.rows[0];
    next();
  } catch (e) {
    if (e.message.includes("jwt")) {
      next(createError("Token expired. Login again", 401));
    } else {
      next(e);
    }
  }
};

const decodeToken = (token) => {
  try {
    // since dev there is no env file
    // we generally put jwtsecret in env
    var decoded = jwt.verify(token, "jwtsecret");
    return decoded;
  } catch (e) {
    throw e;
  }
};
