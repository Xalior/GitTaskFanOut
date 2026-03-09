import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@/lib/session";
import { verifyPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const limit = checkRateLimit(req);
  res.setHeader("X-RateLimit-Remaining", limit.remaining);
  if (!limit.allowed) {
    res.setHeader("Retry-After", limit.retryAfterSec);
    return res.status(429).json({
      error: `Too many login attempts. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minute(s).`,
    });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const valid = await verifyPassword(email, password);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const session = await getSession(req, res);
  session.email = email;
  await session.save();
  return res.json({ email });
}
