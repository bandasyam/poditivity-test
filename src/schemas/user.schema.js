const joi = require("joi");

module.exports.signupSchema = joi.object({
  email: joi.string().required(),
  password: joi.string().required(),
  userName: joi.string().required(),
});

module.exports.loginSchema = joi.object({
  email: joi.string().required(),
  password: joi.string().required(),
});

module.exports.sendRequestSchema = joi.object({
  connectionSentToUserId: joi.number().positive().required(),
});
