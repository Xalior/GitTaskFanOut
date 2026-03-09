import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const startedAt = new Date().toISOString();

let version = "0.1.0";
try {
  const pkg = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf-8")
  );
  version = pkg.version || version;
} catch {}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  return res.json({
    status: "ok",
    version,
    uptime: Math.floor(process.uptime()),
    startedAt,
  });
}
