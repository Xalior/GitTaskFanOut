import fs from "fs";
import path from "path";
import ini from "ini";
import { v4 as uuidv4 } from "uuid";

const DATA_DIR = path.resolve(process.cwd(), "..", "data");
const ROUTES_FILE = path.join(DATA_DIR, "routes.ini");

export interface Route {
  id: string;
  name: string;
  description: string;
  targets: string[];
  active: boolean;
  secret?: string;
  createdAt: string;
}

export interface RoutesConfig {
  [id: string]: {
    name: string;
    description?: string;
    targets: string;
    active: string;
    secret?: string;
    createdAt: string;
  };
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readRoutesFile(): RoutesConfig {
  ensureDataDir();
  if (!fs.existsSync(ROUTES_FILE)) {
    return {};
  }
  const raw = fs.readFileSync(ROUTES_FILE, "utf-8");
  return ini.parse(raw) as RoutesConfig;
}

function writeRoutesFile(config: RoutesConfig) {
  ensureDataDir();
  fs.writeFileSync(ROUTES_FILE, ini.stringify(config), "utf-8");
}

export function getAllRoutes(): Route[] {
  const config = readRoutesFile();
  return Object.entries(config).map(([id, section]) => ({
    id,
    name: section.name || id,
    description: section.description || "",
    targets: (section.targets || "").split(",").map((t) => t.trim()).filter(Boolean),
    active: section.active !== "false",
    secret: section.secret || undefined,
    createdAt: section.createdAt || new Date().toISOString(),
  }));
}

export function getRoute(id: string): Route | null {
  const config = readRoutesFile();
  const section = config[id];
  if (!section) return null;
  return {
    id,
    name: section.name || id,
    description: section.description || "",
    targets: (section.targets || "").split(",").map((t) => t.trim()).filter(Boolean),
    active: section.active !== "false",
    secret: section.secret || undefined,
    createdAt: section.createdAt || new Date().toISOString(),
  };
}

export function createRoute(name: string, targets: string[], secret?: string, description?: string): Route {
  const config = readRoutesFile();
  const id = uuidv4().replace(/-/g, "").slice(0, 16);
  const now = new Date().toISOString();
  config[id] = {
    name,
    description: description || "",
    targets: targets.join(","),
    active: "true",
    createdAt: now,
    ...(secret ? { secret } : {}),
  };
  writeRoutesFile(config);
  return { id, name, description: description || "", targets, active: true, secret, createdAt: now };
}

export function updateRoute(
  id: string,
  updates: { name?: string; description?: string; targets?: string[]; active?: boolean; secret?: string }
): Route | null {
  const config = readRoutesFile();
  if (!config[id]) return null;
  if (updates.name !== undefined) config[id].name = updates.name;
  if (updates.description !== undefined) config[id].description = updates.description;
  if (updates.targets !== undefined) config[id].targets = updates.targets.join(",");
  if (updates.active !== undefined) config[id].active = String(updates.active);
  if (updates.secret !== undefined) config[id].secret = updates.secret || undefined;
  writeRoutesFile(config);
  return getRoute(id);
}

export function deleteRoute(id: string): boolean {
  const config = readRoutesFile();
  if (!config[id]) return false;
  delete config[id];
  writeRoutesFile(config);
  return true;
}
