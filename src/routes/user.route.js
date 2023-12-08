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

/** get my connect requests */
router.get("/connection-requests", validateToken, controller.getUserConnectionRequests);

/** send connect requests */
router.post("/connection-request", validateToken, bodyValidator(schema.sendRequestSchema), controller.sendConnectionRequest);

/** accept a request */
router.patch("/connection-request/:id", validateToken, controller.acceptRequest);

module.exports = router;
