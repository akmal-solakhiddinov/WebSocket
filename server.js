const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

const rooms = new Map();  // roomName -> Set of sockets
const users = new Map();  // username -> { password, socket }

function send(socket, obj) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(obj));
  }
}

function broadcastToRoom(roomName, message, sender) {
  const room = rooms.get(roomName);
  if (!room) return;

  for (const client of room) {
    if (client.readyState === WebSocket.OPEN && client !== sender) {
      client.send(message);
    }
  }
}

function handleLogin(msg, socket) {
  const { username, password } = msg.payload;

  if (!username || !password) {
    send(socket, {
      type: "error",
      payload: { message: "Username and password required" }
    });
    return;
  }

  if (users.has(username)) {
    const userData = users.get(username);

    if (userData.password !== password) {
      send(socket, {
        type: "error",
        payload: { message: "Invalid password" }
      });
      return;
    }

    userData.socket = socket;
    send(socket, {
      type: "system",
      payload: { message: `Welcome back, ${username}` }
    });
  } else {
    users.set(username, { password, socket });
    send(socket, {
      type: "system",
      payload: { message: `User ${username} registered and logged in` }
    });
  }

  socket.username = username;
}

function handleChat(msg, socket) {
  if (!socket.username) {
    send(socket, {
      type: "error",
      payload: { message: "You must log in first" }
    });
    return;
  }

  const { room, text } = msg.payload;
  const reply = {
    type: "chat",
    payload: { text, from: socket.username, room }
  };

  send(socket, reply);

  broadcastToRoom(room, JSON.stringify(reply), socket);
}

function handleJoin(msg, socket) {
  const { room } = msg.payload;

  if (!room) {
    send(socket, {
      type: "error",
      payload: { message: "Room name is required" }
    });
    return;
  }

  if (!rooms.has(room)) rooms.set(room, new Set());
  rooms.get(room).add(socket);

  send(socket, {
    type: "system",
    payload: { message: `Joined ${room}` }
  });
  console.log(`${socket.username || "Unknown"} joined room: ${room}`);
}

server.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch {
      send(socket, {
        type: "error",
        payload: { message: "Invalid JSON" }
      });
      return;
    }

    if (!msg.type) {
      send(socket, {
        type: "error",
        payload: { message: "Message type required" }
      });
      return;
    }

    switch (msg.type) {
      case "login":
        handleLogin(msg, socket);
        break;
      case "chat":
        handleChat(msg, socket);
        break;
      case "joinRoom":
        handleJoin(msg, socket);
        break;
      default:
        send(socket, {
          type: "error",
          payload: { message: "Unknown message type" }
        });
    }
 });

  socket.on("close", () => {
    console.log("Client disconnected");
    for (const [roomName, members] of rooms) {
      if (members.has(socket)) {
        members.delete(socket);
        console.log(`Removed socket from ${roomName}`);
      }
    }
  });
});

console.log("WebSocket server running on ws://localhost:8080");

