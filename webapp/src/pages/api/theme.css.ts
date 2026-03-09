import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const THEME_FILE = path.resolve(process.cwd(), "..", "data", "theme.css");
const BOOTSTRAP_DEFAULT = path.resolve(
  process.cwd(),
  "node_modules",
  "bootstrap",
  "dist",
  "css",
  "bootstrap.min.css"
);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.status(405).end();
    return;
  }

  const file = fs.existsSync(THEME_FILE) ? THEME_FILE : BOOTSTRAP_DEFAULT;
  const stat = fs.statSync(file);

  res.setHeader("Content-Type", "text/css; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60");
  res.setHeader("Last-Modified", stat.mtime.toUTCString());

  if (req.method === "HEAD") {
    res.status(200).end();
    return;
  }

  const css = fs.readFileSync(file, "utf-8");
  res.status(200).send(css);
}
