import type { NextApiRequest, NextApiResponse } from "next";
import { createPasswordResetToken } from "@/lib/auth";
import { sendPasswordResetEmail, isSmtpConfigured } from "@/lib/mail";
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

  if (!isSmtpConfigured()) {
    return res.status(503).json({ error: "Email is not configured on this server." });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Always return success to avoid leaking whether an email exists
  const token = createPasswordResetToken(email);
  if (token) {
    const proto = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:6175";
    const baseUrl = `${proto}://${host}`;
    try {
      await sendPasswordResetEmail(email, token, baseUrl);
    } catch {
      // Log but don't expose SMTP errors to client
      console.error("Failed to send password reset email");
    }
  }

  return res.json({ ok: true, message: "If an account with that email exists, a reset link has been sent." });
}
