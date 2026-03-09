import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@/lib/session";
import { changePassword } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getSession(req, res);
  if (!session.email) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "Both old and new passwords are required" });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }

  try {
    await changePassword(session.email, oldPassword, newPassword);
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("[change-password]", err);
    return res.status(400).json({ error: "Password change failed" });
  }
}
