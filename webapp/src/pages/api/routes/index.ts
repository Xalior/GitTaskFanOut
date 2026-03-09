import type { NextApiRequest, NextApiResponse } from "next";
import { getAllRoutes, createRoute } from "@/lib/config";
import { requireAuth } from "@/lib/requireAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === "GET") {
    return res.json(getAllRoutes());
  }

  if (req.method === "POST") {
    const { name, targets, secret, description } = req.body;
    if (!name || !Array.isArray(targets) || targets.length === 0) {
      return res.status(400).json({ error: "name and targets[] are required" });
    }
    const route = createRoute(name, targets, secret, description);
    return res.status(201).json(route);
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
