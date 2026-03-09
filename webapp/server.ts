import { createServer } from "http";
import next from "next";
import morgan from "morgan";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "6175", 10);

const app = next({ dev });
const handle = app.getRequestHandler();

const logger = morgan(
  dev
    ? "dev"
    : ":remote-addr :method :url :status :res[content-length] - :response-time ms"
);

app.prepare().then(() => {
  const server = createServer((req, res) => {
    logger(req, res, () => {
      handle(req, res);
    });
  });

  server.listen(port, () => {
    console.log(`> Git Task Fan Out listening on http://0.0.0.0:${port}`);
    console.log(`> Environment: ${dev ? "development" : "production"}`);
  });
});
