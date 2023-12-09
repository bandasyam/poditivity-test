const { db } = require("../database/database.connection");

async function joinRoom(io, socket, connectionId) {
  try {
    socket.join(connectionId);
    io.emit("rooms", "joined in room");
  } catch (e) {
    console.log("Error in join room", e);
    return io.to(socket.id).emit("error", { message: e.message, statusCode: 500, stack: "joinRoom" });
  }
}

async function sendMessage(io, socket, connectionId, message) {
  try {
    console.log("socket.user", socket.user);
    const userId = socket.user.id;
    var connectionId = connectionId;
    var message = message;

    console.log("message", message, "connectionId", connectionId);

    // insert data to database
    var insertData = await db.query('insert into messages ("connectionId", "messagesentby", "message", "timestamp") values ($1, $2, $3, $4)', [
      connectionId,
      userId,
      message,
      parseInt(Date.now() / 1000),
    ]);
    console.log(insertData.rowCount);
    if (!insertData.rowCount) {
      return io.to(socket.id).emit("error", { message: "couldn't insert message", statusCode: 500, stack: "sendMessage" });
    }

    io.to(connectionId).emit("message", { sentBy: userId, message: message });
  } catch (e) {
    console.log("Error in send message", e);
    return io.to(socket.id).emit("error", { message: e.message, statusCode: 500, stack: "send message" });
  }
}

module.exports = { joinRoom, sendMessage };
