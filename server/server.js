const http = require("http");
const app = require("./app");
const { initializeWebSocket } = require("./services/websocketService");

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

initializeWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
