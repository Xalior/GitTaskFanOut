import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "./session";

export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<string | null> {
  const session = await getSession(req, res);
  if (!session.email) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return session.email;
}
