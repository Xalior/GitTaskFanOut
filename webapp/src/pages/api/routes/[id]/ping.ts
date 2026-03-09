import type { NextApiRequest, NextApiResponse } from "next";
import { getRoute } from "@/lib/config";
import { requireAuth } from "@/lib/requireAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  const id = req.query.id as string;
  const route = getRoute(id);
  if (!route) return res.status(404).json({ error: "Route not found" });

  const results = await Promise.allSettled(
    route.targets.map(async (target) => {
      const url = target.replace(/\/+$/, "");
      const start = Date.now();
      try {
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            zen: "Git Task Fan Out ping test",
            hook_id: 0,
            hook: { type: "ping", id: route.id },
            sender: { login: "git-task-fanout" },
          }),
          signal: AbortSignal.timeout(10_000),
        });
        return {
          target: url,
          status: resp.status,
          ok: resp.ok,
          durationMs: Date.now() - start,
        };
      } catch (err: any) {
        return {
          target: url,
          status: null,
          ok: false,
          error: err.message || String(err),
          durationMs: Date.now() - start,
        };
      }
    })
  );

  const mapped = results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { target: "unknown", status: null, ok: false, error: String(r.reason), durationMs: 0 }
  );

  return res.json({ route: id, results: mapped });
}
