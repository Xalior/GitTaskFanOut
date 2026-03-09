import type { NextApiRequest, NextApiResponse } from "next";
import { getRoute } from "@/lib/config";
import { relayWebhook } from "@/lib/relay";
import { checkRateLimit } from "@/lib/rateLimit";
import crypto from "crypto";

export const config = {
  api: { bodyParser: false },
};

const MAX_BODY_BYTES = 108 * 1024 * 1024; // 108 MB

function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY_BYTES) {
        req.destroy();
        reject(new Error("Payload too large"));
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function verifySignature(secret: string, body: Buffer, req: NextApiRequest): boolean {
  // GitHub: X-Hub-Signature-256
  const ghSig = req.headers["x-hub-signature-256"] as string | undefined;
  if (ghSig) {
    const expected = "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(ghSig), Buffer.from(expected));
  }

  // Gitea: X-Gitea-Signature
  const giteaSig = req.headers["x-gitea-signature"] as string | undefined;
  if (giteaSig) {
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(giteaSig), Buffer.from(expected));
  }

  // GitLab: X-Gitlab-Token (plain token comparison)
  const glToken = req.headers["x-gitlab-token"] as string | undefined;
  if (glToken) {
    return crypto.timingSafeEqual(Buffer.from(glToken), Buffer.from(secret));
  }

  // No signature header present but secret configured — reject
  return false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const slug = req.query.slug;
  if (!slug || !Array.isArray(slug) || slug.length === 0) {
    return res.status(400).json({ error: "Missing route id" });
  }

  // Rate limit unauthenticated webhook ingress
  const limit = checkRateLimit(req, "hook");
  if (!limit.allowed) {
    res.setHeader("Retry-After", limit.retryAfterSec);
    return res.status(429).json({ error: "Too many requests" });
  }

  const routeId = slug[0];
  const extraPath = slug.length > 1 ? "/" + slug.slice(1).join("/") : "";

  const route = getRoute(routeId);
  if (!route) {
    return res.status(404).json({ error: "Route not found" });
  }
  if (!route.active) {
    return res.status(503).json({ error: "Route is disabled" });
  }
  if (route.targets.length === 0) {
    return res.status(502).json({ error: "No targets configured" });
  }

  let body: Buffer;
  try {
    body = await getRawBody(req);
  } catch {
    return res.status(413).json({ error: "Payload too large" });
  }

  // Verify signature if secret is configured
  if (route.secret) {
    if (!verifySignature(route.secret, body, req)) {
      return res.status(401).json({ error: "Signature verification failed" });
    }
  }

  const results = await relayWebhook(
    route.targets,
    req.method || "POST",
    req.headers,
    body,
    extraPath
  );

  const allOk = results.every((r) => r.ok);
  const succeeded = results.filter((r) => r.ok).length;
  const retried = results.filter((r) => r.attempts > 1).length;
  console.log(
    `[webhook] route=${routeId} method=${req.method} targets=${results.length} allOk=${allOk}` +
      (retried ? ` retried=${retried}` : "")
  );

  return res.status(allOk ? 200 : 207).json({
    route: routeId,
    targets: results.length,
    succeeded,
    failed: results.length - succeeded,
  });
}
