    const io = new WebSocket("ws://localhost:8080");
    const conStatus = document.getElementById("connection_status");

    const loginForm = document.getElementById("login_form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const roomForm = document.getElementById("room_form");
    const roomInput = document.getElementById("room_id");

    const chatForm = document.getElementById("chat_form");
    const chatInput = document.getElementById("chat_input");

    const messageBox = document.getElementById("message-box");

    let currentUser = null;
    let currentRoom = null;

    io.onopen = function () {
      conStatus.textContent = "Connected";
    };

    io.onmessage = function (event) {
      const data = JSON.parse(event.data);

      if (data.type === "system") {
        alert(data.payload.message);
      }

      if (data.type === "chat") {
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const msgEl = `
          <div class="message ${data.payload.from === currentUser ? "user" : "other"}">
            <span class="sender">${data.payload.from}</span>
            <p class="text">${data.payload.text}</p>
            <span class="time">${time}</span>
          </div>
        `;
        messageBox.innerHTML += msgEl;
        messageBox.scrollTop = messageBox.scrollHeight;
      }
    };

    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
      if (!username || !password) return;

      io.send(JSON.stringify({ 
        type: "login", 
        payload: { username, password } 
      }));

      currentUser = username;
    });

    roomForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const roomName = roomInput.value.trim();
      if (!roomName) return;

      io.send(JSON.stringify({ 
        type: "joinRoom", 
        payload: { room: roomName } 
      }));

      currentRoom = roomName;
    });

    chatForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const message = chatInput.value.trim();
      if (!message || !currentRoom) return;

      io.send(JSON.stringify({
        type: "chat",
        payload: { text: message, room: currentRoom }
      }));

      chatInput.value = "";
    });
