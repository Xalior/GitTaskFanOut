import type { NextApiRequest, NextApiResponse } from "next";
import { resetPasswordWithToken } from "@/lib/auth";
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

  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required" });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  try {
    await resetPasswordWithToken(token, newPassword);
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("[reset-password]", err);
    return res.status(400).json({ error: "Password reset failed" });
  }
}
