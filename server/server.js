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

// 1) Prepend pyenv shims just in case
const os = require("os");
const homedir = os.homedir();
process.env.PATH = [
  `${homedir}/.pyenv/shims`,
  `${homedir}/.pyenv/bin`,
  process.env.PATH,
].join(":");

// 2) execSync helper
const { execSync } = require("child_process");
function debug(cmd) {
  try {
    const out = execSync(cmd, { encoding: "utf8" }).trim();
    console.log(`[DEBUG] $ ${cmd} →\n${out}`);
  } catch (err) {
    console.error(`[DEBUG-ERROR] $ ${cmd} →\n${err.message}`);
  }
}

// 3) Dump env vars
console.log("[DEBUG] process.env.PATH =", process.env.PATH);
console.log("[DEBUG] process.env.PYENV_ROOT =", process.env.PYENV_ROOT);

// 4) Find every python on PATH
debug("which -a python");
debug("which -a python3");

// 5) Show the first python3 version
debug("python3 --version");

// 6) Try importing moviepy.editor
debug(`python3 - <<'PY'
try:
  import moviepy.editor
  print("moviepy.editor OK")
except Exception as e:
  print("moviepy.editor ERROR:", e)
PY`);

// 7) Start HTTP + WebSocket server
const http = require("http");
const app = require("./app");
const { initializeWebSocket } = require("./services/websocketService");

const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
initializeWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});