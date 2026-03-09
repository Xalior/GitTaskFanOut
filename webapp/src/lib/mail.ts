import fs from "fs";
import path from "path";
import ini from "ini";
import nodemailer from "nodemailer";

const DATA_DIR = path.resolve(process.cwd(), "..", "data");

function getSmtpUrl(): string {
  // Env var takes priority, then fall back to INI [smtp].url
  if (process.env.SMTP_URL) return process.env.SMTP_URL;

  const metaFile = path.join(DATA_DIR, "auth.ini");
  if (fs.existsSync(metaFile)) {
    const raw = ini.parse(fs.readFileSync(metaFile, "utf-8"));
    if (raw.smtp?.url) return raw.smtp.url;
  }
  return "";
}

function getFromAddress(): string {
  if (process.env.SMTP_FROM) return process.env.SMTP_FROM;

  const metaFile = path.join(DATA_DIR, "auth.ini");
  if (fs.existsSync(metaFile)) {
    const raw = ini.parse(fs.readFileSync(metaFile, "utf-8"));
    if (raw.smtp?.from) return raw.smtp.from;
  }
  return "noreply@localhost";
}

export function isSmtpConfigured(): boolean {
  return !!getSmtpUrl();
}

export async function sendPasswordResetEmail(to: string, resetToken: string, baseUrl: string): Promise<void> {
  const smtpUrl = getSmtpUrl();
  if (!smtpUrl) {
    throw new Error("SMTP is not configured. Set SMTP_URL environment variable or smtp.url in auth.ini.");
  }

  const transport = nodemailer.createTransport(smtpUrl);
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
  const from = getFromAddress();

  await transport.sendMail({
    from,
    to,
    subject: "Password Reset - Git Task Fan Out",
    text: `You requested a password reset.\n\nClick the link below to reset your password (valid for 1 hour):\n\n${resetLink}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>You requested a password reset.</p>
<p>Click the link below to reset your password (valid for 1 hour):</p>
<p><a href="${resetLink}">${resetLink}</a></p>
<p>If you did not request this, you can ignore this email.</p>`,
  });
}
