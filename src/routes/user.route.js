var express = require("express");
var router = express.Router();

const controller = require("../controllers/users.controller");
const { validateToken } = require("../middlewares/tokenValidator.middleware.js");
const { bodyValidator } = require("../middlewares/bodyValidator.middleware");
const schema = require("../schemas/user.schema");

/* GET users listing. */
router.get("/", controller.getUsers);

/** signup api */
router.post("/signup", bodyValidator(schema.signupSchema), controller.signup);

/** login api */
router.post("/login", bodyValidator(schema.loginSchema), controller.login);

module.exports = router;
