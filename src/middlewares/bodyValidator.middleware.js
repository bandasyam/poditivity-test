var createError = require("http-errors");

module.exports.bodyValidator = (schema) => {
  return (req, res, next) => {
    var { value, error } = schema.required().validate(req.body);
    if (error) {
      next(createError(error.message, 400));
    } else {
      req.body = value;
      next();
    }
  };
};
