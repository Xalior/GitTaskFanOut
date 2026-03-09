import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@/lib/session";
import { isFirstRun } from "@/lib/auth";
import { isSmtpConfigured } from "@/lib/mail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getSession(req, res);
  const firstRun = isFirstRun();

  return res.json({
    firstRun,
    loggedIn: !!session.email,
    email: session.email || null,
    smtpConfigured: isSmtpConfigured(),
  });
}
