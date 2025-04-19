// const http = require("http");
// const app = require("./app");
// const { initializeWebSocket } = require("./services/websocketService");

// const PORT = process.env.PORT || 8080;

// const server = http.createServer(app);

// initializeWebSocket(server);

// server.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });


// server.js

// 1) Ensure pyenv shims are in PATH
const os = require("os");
const homedir = os.homedir();
process.env.PATH = [
  `${homedir}/.pyenv/shims`,
  `${homedir}/.pyenv/bin`,
  process.env.PATH
].join(":");

// 2) Debug helper
const { execSync } = require("child_process");
function debug(cmd) {
  try {
    const out = execSync(cmd, { encoding: "utf8" }).trim();
    console.log(`[DEBUG] $ ${cmd} → ${out}`);
  } catch (err) {
    console.error(`[DEBUG-ERROR] $ ${cmd} → ${err.message}`);
  }
}

// 3) Run our sanity checks before starting the server
debug("which python3");
debug("python3 --version");
debug(`python3 - <<'PY'
try:
  import moviepy.editor
  print("moviepy.editor OK")
except Exception as e:
  print("moviepy.editor ERROR:", e)
PY`);

// 4) Now start the HTTP + WebSocket server
const http = require("http");
const app = require("./app");
const { initializeWebSocket } = require("./services/websocketService");

const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

initializeWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});