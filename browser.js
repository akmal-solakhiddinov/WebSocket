const WebSocket = require("ws");

const socket = new WebSocket("ws://localhost:8080");

socket.on("open", () => {
    console.log("Connected to server");
    // { "type": "joinRoom", "payload": { "room": "room1" } }


    socket.send(JSON.stringify({
        type: "joinRoom", payload: { room: "room1" }
    }));

    process.stdin.on("data", (data) => {
        const message = data.toString().trim();

        if (message.length <= 0) return;
        socket.send(JSON.stringify({

            type: "chat",

            payload: {
                text: message,
                room: "room1"
            }

        }));
    });
});

socket.on("message", (msg) => {
    console.log("Received:", msg.toString());
});
