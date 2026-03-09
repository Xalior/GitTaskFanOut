import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const THEME_FILE = path.resolve(process.cwd(), "..", "data", "theme.css");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  if (!fs.existsSync(THEME_FILE)) {
    return res.status(404).end();
  }

  const stat = fs.statSync(THEME_FILE);
  const css = fs.readFileSync(THEME_FILE, "utf-8");

  res.setHeader("Content-Type", "text/css; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60");
  res.setHeader("Last-Modified", stat.mtime.toUTCString());
  return res.status(200).send(css);
}
