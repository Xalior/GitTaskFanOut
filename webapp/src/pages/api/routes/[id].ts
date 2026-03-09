import type { NextApiRequest, NextApiResponse } from "next";
import { getRoute, updateRoute, deleteRoute } from "@/lib/config";
import { requireAuth } from "@/lib/requireAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const id = req.query.id as string;

  if (req.method === "GET") {
    const route = getRoute(id);
    if (!route) return res.status(404).json({ error: "Not found" });
    return res.json(route);
  }

  if (req.method === "PUT") {
    const { name, description, targets, active, secret } = req.body;
    const route = updateRoute(id, { name, description, targets, active, secret });
    if (!route) return res.status(404).json({ error: "Not found" });
    return res.json(route);
  }

  if (req.method === "DELETE") {
    const ok = deleteRoute(id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    return res.status(204).end();
  }

  res.setHeader("Allow", "GET, PUT, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
