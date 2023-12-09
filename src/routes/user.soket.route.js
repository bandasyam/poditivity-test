const controller = require("../controllers/users.socket.controller.js");
const { db } = require("../database/database.connection.js");

function socketEventManagment(io, socket) {
  try {
    /** join in a match room */
    socket.on("join-room", async (data) => {
      try {
        const connectionId = data.connectionId;

        if (!connectionId) {
          return io.to(socket.io).emit("error", { message: "please mention connectionId", statusCode: 400, stack: "join-room" });
        }

        // check if given connection exists in database
        var isConnectionId = await db.query("SELECT * from connections where id = $1", [connectionId]);
        if (!isConnectionId.rows.length) {
          return io.to(socket.id).emit("error", { message: "given connection is not found", statusCode: 404, stack: "join-room" });
        }

        controller.joinRoom(io, socket, connectionId);
      } catch (e) {
        console.log(e);
        io.to(socket.id).emit("error", { message: e.message, statusCode: e.status ? e.status : 500, stack: "join-room" });
      }
    });

    /** send a messages */
    socket.on("send-message", async (data) => {
      try {
        const message = data.message;
        const connectionId = data.connectionId;

        if (!message) {
          return io.to(socket.io).emit("error", { message: "please mention message", statusCode: 400, stack: "send-message" });
        }

        if (!connectionId) {
          return io.to(socket.io).emit("error", { message: "please mention connectionId", statusCode: 400, stack: "send-message" });
        }

        // check if given connection exists in database
        var isConnectionId = await db.query("SELECT * from connections where id = $1", [connectionId]);
        if (!isConnectionId.rows.length) {
          return io.to(socket.id).emit("error", { message: "given connection is not found", statusCode: 404, stack: "join-room" });
        }

        controller.sendMessage(io, socket, connectionId, message);
      } catch (e) {
        console.log(e);
        io.to(socket.id).emit("error", { message: e.message, statusCode: e.status ? e.status : 500, stack: "join-room" });
      }
    });
  } catch (e) {
    console.error("Error in socketEventManagment", e);
    io.to(socket.id).emit("error", { message: e.message, status: 500, stack: "socketEventManagment" });
  }
}

module.exports = { socketEventManagment };
