class Test1Router {
  constructor() {
    this.routes = [
      { method: "GET", path: "/test1", handler: this.get.bind(this) },
      { method: "POST", path: "/test1", handler: this.post.bind(this) },
      { method: "OPTIONS", path: "/test1", handler: this.options.bind(this) },
    ];
  }

  get(req, res) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Test1 GET route" }));
  }

  post(req, res) {
    handleContentTypes(req, res, {
      "application/json": (data) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "Test1 POST route - JSON data received",
            data,
          }),
        );
      },
      "application/xml": (data) => {
        res.writeHead(200, { "Content-Type": "application/xml" });
        res.end("<response>Test1 POST route - XML data received</response>");
      },
      "application/x-www-form-urlencoded": (data) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "Test1 POST route - Form data received",
            data,
          }),
        );
      },
    });
  }

  options(req, res) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end();
  }
}

export default Test1Router;
