const WebSocket = require("ws");

const socket = new WebSocket("ws://localhost:8080");

socket.on("open", () => {
    console.log("Connected to server");
    process.stdin.on("data", (data) => {
        const message = data.toString().trim();
        if (message.length <= 0) return;
        socket.send(message);
    });
});

socket.on("message", (msg) => {
    console.log("Received:", msg.toString());
});
