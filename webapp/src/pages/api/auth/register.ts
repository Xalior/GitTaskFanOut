import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@/lib/session";
import { isFirstRun, registerUser } from "@/lib/auth";
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
      error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minute(s).`,
    });
  }

  // Only allow registration on first run (no users exist yet)
  if (!isFirstRun()) {
    return res.status(403).json({ error: "Registration is closed. An admin already exists." });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  try {
    const user = await registerUser(email, password);
    const session = await getSession(req, res);
    session.email = user.email;
    await session.save();
    return res.status(201).json({ email: user.email });
  } catch (err: any) {
    console.error("[register]", err);
    return res.status(400).json({ error: "Registration failed" });
  }
}
