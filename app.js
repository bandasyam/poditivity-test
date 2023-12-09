var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const io = require("socket.io")();

var usersRouter = require("./src/routes/user.route");
var { socketEventManagment } = require("./src/routes/user.soket.route");
const { decodeSocketToken } = require("./src/middlewares/tokenValidator.middleware");

const db = require("./src/database/database.connection");
db.connectDb();

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  var status = err.status || 500;
  var message = err.message || "message undefined";

  // send error
  res.status(status).send({ message: message });
});

// sockets
// decode socket token
io.use((socket, next) => {
  try {
    decodeSocketToken(socket);
    next();
  } catch (e) {
    console.log("1");
    return next(e);
  }
});

io.on("connection", (socket) => {
  io.to(socket.id).emit("connection", { status: 200, message: `You are connected` });
  socketEventManagment(io, socket);
});

io.listen(3080);

module.exports = app;
