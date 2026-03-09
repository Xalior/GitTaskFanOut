import type { NextApiRequest, NextApiResponse } from "next";
import { getRoute, createRoute } from "@/lib/config";
import { requireAuth } from "@/lib/requireAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  const id = req.query.id as string;
  const source = getRoute(id);
  if (!source) return res.status(404).json({ error: "Route not found" });

  const newRoute = createRoute(
    source.name + " (copy)",
    source.targets,
    source.secret,
    source.description
  );

  return res.status(201).json(newRoute);
}
