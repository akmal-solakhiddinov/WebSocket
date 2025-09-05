const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

server.on("connection", (socket) => {
  console.log(" Client connected");

  socket.on("message", (msg) => {
    console.log("Received:", msg.toString());
    socket.send("Hello from server");
  });
});  

