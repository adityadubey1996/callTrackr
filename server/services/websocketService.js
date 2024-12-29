const WebSocket = require("ws");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";
const userConnections = new Map();
// WebSocket server initialization
const initializeWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    // Extract token from query parameters
    const token = new URLSearchParams(req.url.split("?")[1]).get("token");

    if (!token) {
      ws.send(JSON.stringify({ type: "error", message: "Token is required" }));
      ws.close();
      return;
    }

    try {
      const user = jwt.verify(token, SECRET_KEY); // Verify token
      ws.user = user; // Attach user info to the WebSocket
      ws.send(
        JSON.stringify({ type: "success", message: "Connected successfully" })
      );
      userConnections.set(user.id, ws);
      console.log(`User connected: ${user.id}`);

      ws.on("message", (message) => {
        console.log(`Message from user ${ws.user?.id}: ${message}`);
        // Handle incoming messages
      });

      ws.on("close", () => {
        console.log(`Connection closed for user ${ws.user?.id}`);
        userConnections.delete(user.id);
      });

      ws.on("error", (error) => {
        console.error(
          `WebSocket error for user ${ws.user?.id}: ${error.message}`
        );
      });
    } catch (error) {
      console.error("error", error);
      ws.send(
        JSON.stringify({ type: "error", message: "Invalid or expired token" })
      );
      ws.close();
      return;
    }
  });

  console.log("WebSocket server initialized.");
};

const notifyUser = (userId, message) => {
  const ws = userConnections.get(userId);

  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log("ws for userId", message, userId);
    ws.send(JSON.stringify(message));
  }
};

module.exports = { initializeWebSocket, notifyUser };
