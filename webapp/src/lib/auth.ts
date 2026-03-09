import fs from "fs";
import path from "path";
import ini from "ini";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const DATA_DIR = path.resolve(process.cwd(), "..", "data");
const USERS_FILE = path.join(DATA_DIR, "users.ini");
const BCRYPT_ROUNDS = 12;

export interface User {
  email: string;
  role: "admin";
  createdAt: string;
}

interface UserEntry {
  hash: string;
  role: string;
  createdAt: string;
  resetToken?: string;
  resetExpires?: string;
}

interface UsersConfig {
  [email: string]: UserEntry;
}

function getPepper(): string {
  if (process.env.AUTH_PEPPER) return process.env.AUTH_PEPPER;

  const metaFile = path.join(DATA_DIR, "auth.ini");
  if (fs.existsSync(metaFile)) {
    const raw = ini.parse(fs.readFileSync(metaFile, "utf-8"));
    if (raw._meta?.pepper) return raw._meta.pepper;
  }
  return "";
}

function peppered(password: string): string {
  const pepper = getPepper();
  const combined = pepper ? password + pepper : password;
  // bcrypt silently truncates at 72 bytes; truncate explicitly for consistency
  return combined.length > 72 ? combined.slice(0, 72) : combined;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readUsersFile(): UsersConfig {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) return {};
  return ini.parse(fs.readFileSync(USERS_FILE, "utf-8")) as UsersConfig;
}

function writeUsersFile(config: UsersConfig) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, ini.stringify(config), "utf-8");
}

export function isFirstRun(): boolean {
  const users = readUsersFile();
  return Object.keys(users).length === 0;
}

export function getUser(email: string): User | null {
  const users = readUsersFile();
  const entry = users[email];
  if (!entry) return null;
  return { email, role: "admin", createdAt: entry.createdAt };
}

export async function registerUser(email: string, password: string): Promise<User> {
  const users = readUsersFile();
  if (users[email]) {
    throw new Error("User already exists");
  }
  const hash = await bcrypt.hash(peppered(password), BCRYPT_ROUNDS);
  const now = new Date().toISOString();
  users[email] = { hash, role: "admin", createdAt: now };
  writeUsersFile(users);
  return { email, role: "admin", createdAt: now };
}

export async function verifyPassword(email: string, password: string): Promise<boolean> {
  const users = readUsersFile();
  const entry = users[email];
  if (!entry) return false;
  return bcrypt.compare(peppered(password), entry.hash);
}

export async function changePassword(email: string, oldPassword: string, newPassword: string): Promise<void> {
  const valid = await verifyPassword(email, oldPassword);
  if (!valid) throw new Error("Current password is incorrect");
  const users = readUsersFile();
  if (!users[email]) throw new Error("User not found");
  users[email].hash = await bcrypt.hash(peppered(newPassword), BCRYPT_ROUNDS);
  writeUsersFile(users);
}

export function createPasswordResetToken(email: string): string | null {
  const users = readUsersFile();
  const entry = users[email];
  if (!entry) return null;

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
  entry.resetToken = token;
  entry.resetExpires = expires;
  writeUsersFile(users);
  return token;
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
  const users = readUsersFile();
  for (const email of Object.keys(users)) {
    const entry = users[email];
    if (
      entry.resetToken &&
      entry.resetToken.length === token.length &&
      crypto.timingSafeEqual(Buffer.from(entry.resetToken), Buffer.from(token))
    ) {
      if (!entry.resetExpires || new Date(entry.resetExpires) < new Date()) {
        throw new Error("Reset token has expired");
      }
      entry.hash = await bcrypt.hash(peppered(newPassword), BCRYPT_ROUNDS);
      delete entry.resetToken;
      delete entry.resetExpires;
      writeUsersFile(users);
      return;
    }
  }
  throw new Error("Invalid reset token");
}
