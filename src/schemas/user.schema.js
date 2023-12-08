const joi = require("joi");

module.exports.signupSchema = joi.object({
  email: joi.string().required(),
  password: joi.string().required(),
  userName: joi.string().required(),
});
