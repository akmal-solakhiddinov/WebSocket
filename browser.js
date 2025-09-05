const WebSocket = require("ws");

const socket = new WebSocket("ws://localhost:8080");

socket.on("open", () => {
  console.log("🔗 Connected to server");
  socket.send("Hello from client");
});

socket.on("message", (msg) => {
  console.log("Received:", msg.toString());
});  

