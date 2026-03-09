import { getIronSession, type IronSession } from "iron-session";
import type { IncomingMessage, ServerResponse } from "http";

export interface SessionData {
  email?: string;
}

const SESSION_OPTIONS = {
  password:
    process.env.SESSION_SECRET ||
    "this-is-a-dev-secret-change-me-in-production-at-least-32-chars!!",
  cookieName: "git-task-fanout-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

export async function getSession(
  req: IncomingMessage,
  res: ServerResponse
): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(req, res, SESSION_OPTIONS);
}
