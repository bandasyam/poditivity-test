var express = require("express");
var router = express.Router();

const controller = require("../controllers/users.controller");
const { validator } = require("../middlewares/bodyValidator.middleware");
const schema = require("../schemas/user.schema");

/* GET users listing. */
router.get("/", controller.getUsers);

/** signup api */
router.post("/signup", validator(schema.signupSchema), controller.signup);

/** login api */
router.post("/login", validator(schema.loginSchema), controller.login);

module.exports = router;
