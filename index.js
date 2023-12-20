import http from "http";
import { parse } from "url";
import fs from "fs/promises";

async function loadRouters() {
  const files = await fs.readdir("./routes");
  const routers = [];

  for (const file of files) {
    if (file.endsWith("Router.js")) {
      const module = await import(`./routes/${file}`);
      const routerInstance = new module.default();
      routers.push(routerInstance);
    }
  }

  return routers;
}

function handleContentTypes(req, res, handlers) {
  let data = "";

  req.on("data", (chunk) => {
    data += chunk;
  });

  req.on("end", () => {
    const contentType = req.headers["content-type"];

    if (handlers[contentType]) {
      handlers[contentType](data);
    } else {
      res.writeHead(415, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unsupported Media Type" }));
    }
  });
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
