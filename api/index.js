import http from "http";
import { parse } from "url";
import fs from "fs/promises";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.join(__dirname, "/routes");

async function loadRouters() {
  const files = await fs.readdir(baseDir);
  const routers = [];

  for (const file of files) {
    if (file.endsWith("Router.js")) {
      const fpath = pathToFileURL(path.join(baseDir, file));
      const module = await import(fpath);
      const routerInstance = new module.default();
      routers.push(routerInstance);
    }
  }

  return routers;
}

const router = {
  async handleRequest(req, res) {
    const { pathname } = parse(req.url, true);

    const routers = await loadRouters();

    let routeFound = false;

    for (const router of routers) {
      const route = router.routes.find(
        (r) => r.method === req.method && r.path === pathname,
      );

      if (route) {
        route.handler(req, res);
        routeFound = true;
        break;
      }
    }

    if (!routeFound) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not Found" }));
    }
  },
};

const server = http.createServer((req, res) => {
  router.handleRequest(req, res);
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

process.on("SIGINT", () => {
  console.log("Server is shutting down...");
  server.close(() => {
    console.log("Server has shut down.");
    process.exit(0);
  });
});
