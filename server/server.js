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

// 1) Ensure pyenv shims & bin are at the front of PATH
const { execSync } = require("child_process");
function debug(cmd) {
  try {
    const out = execSync(cmd, { encoding: "utf8" }).trim();
    console.log(`[DEBUG] $ ${cmd} →\n${out}\n`);
  } catch (err) {
    console.error(`[DEBUG-ERROR] $ ${cmd} →\n${err.message}\n`);
  }
}

// Existing debug steps…
console.log("[DEBUG] process.env.PATH =", process.env.PATH);
console.log("[DEBUG] process.env.PYENV_ROOT =", process.env.PYENV_ROOT);
debug("which -a python3");
debug("python3 --version");

// **New: dump sys.path and check for moviepy files**
debug(`python3 - << 'PY'
import sys, os, json
# Print sys.path
print("sys.path:", json.dumps(sys.path, indent=2))
# Find all site-packages entries
sp = [p for p in sys.path if 'site-packages' in p]
print("site-packages dirs:", json.dumps(sp, indent=2))
# Check moviepy package presence on each path
for p in sp:
    mp = os.path.join(p, 'moviepy')
    ed = os.path.join(mp, 'editor')
    print(p, "-> moviepy folder exists?", os.path.isdir(mp), "; editor exists?", os.path.isdir(ed))
PY`);

// Then your import test as before
debug(`python3 - << 'PY'
try:
    import moviepy.editor
    print("moviepy.editor OK")
except Exception as e:
    print("moviepy.editor ERROR:", e)
PY`);

// 7) Now start HTTP + WebSocket server
const http = require("http");
const app = require("./app");
const { initializeWebSocket } = require("./services/websocketService");

const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
initializeWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});