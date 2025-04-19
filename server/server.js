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

// 1) Prepend pyenv shims so that `python3` hopefully resolves correctly
const os = require("os");
const homedir = os.homedir();
process.env.PATH = [
  `${homedir}/.pyenv/shims`,
  `${homedir}/.pyenv/bin`,
  process.env.PATH
].join(":");

// 2) Bring in execSync for our debug checks
const { execSync } = require("child_process");

// Helper to run a command and log cleanly
function debug(cmd) {
  try {
    const out = execSync(cmd, { encoding: "utf8" }).trim();
    console.log(`[DEBUG] $ ${cmd} → ${out}`);
  } catch (err) {
    console.error(`[DEBUG-ERROR] $ ${cmd} → ${err.message}`);
  }
}

// 3) Dump out the PATH so you see exactly what PM2 inherited
console.log(`[DEBUG] process.env.PATH = ${process.env.PATH}`);

// 4) Show every python3 on the PATH
debug("which -a python3");

// 5) Check the version of whichever python3 is first
debug("python3 --version");

// 6) Try importing moviepy.editor
debug(`python3 - <<'PY'
try:
  import moviepy.editor
  print("moviepy.editor OK")
except Exception as e:
  print("moviepy.editor ERROR:", e)
PY`);

// 7) Now start your HTTP + WebSocket server
const http = require("http");
const app = require("./app");
const { initializeWebSocket } = require("./services/websocketService");

const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
initializeWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});