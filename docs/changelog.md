# 📋 Changelog

All notable changes to this project will be documented in this file.

---

## 🏷️ v0.2.2 — 2026-03-10 (WIP)

### 🎨 Changes

- 🎨 **Navbar uses theme primary colour** — both landing page and dashboard navbars now use `bg="primary"` instead of hardcoded `bg="dark"`, so the topbar colour matches the active theme (e.g. purple with NBN24)

---

## 🏷️ v0.2.1 — 2026-03-09

### 🐛 Fixes

- 🐳 **Docker data volume mount** — fixed volume mount path (`/data` → `/app/data`) to match the app's path resolution
- 🐳 **Container permissions** — Dockerfile now creates `/app/data` owned by `appuser` so the app works without a pre-existing volume mount
- 🐳 **Healthcheck port** — now uses `$PORT` variable instead of hardcoded `6175`

### 🔧 Changes

- 🤖 **CI/CD** — added GitHub Actions workflow to build and push Docker images to GHCR on version tags

---

## 🏷️ v0.2.0 — 2026-03-09

### ✨ Features

- 🌙 **Dark/Light Mode** — theme toggle in both navbars (landing page and dashboard) with light, dark, and auto (system preference) options. Preference persisted via cookie with FOUC-free server-side initialisation
- 🎨 **Runtime Theme System** — `/api/theme.css` now serves a complete Bootstrap CSS bundle at runtime. Custom themes in `data/theme.css` fully replace Bootstrap (not layered on top), so all Sass variables work correctly. Falls back to stock `bootstrap.min.css` when no custom theme is present
- 🎨 **NBN24 Example Theme** — standalone Bootswatch "Pulse" theme in `themes/nbn24/` with its own build system (Sass, no Docker required). Purple primary, no rounded corners, custom component styling

### 🔧 Changes

- ♻️ **Bootstrap no longer compiled at build time** — the webapp's SCSS only contains app-specific styles. Bootstrap is provided entirely by the runtime theme endpoint
- 📦 **Added `react-bootstrap-icons`** dependency for the theme toggle UI
- 📝 **Updated documentation** — README and theme README rewritten to explain the new theming architecture and how to create custom themes out-of-tree

---

## 🏷️ v0.1.1 — 2026-03-09

### 🐛 Fixes

- 🐳 **Docker build fix** — Dockerfile now builds from repo root so pnpm workspace lockfile is available
- 📄 **`.dockerignore`** — added to exclude `node_modules`, `.next`, `data`, and `.git` from build context
- 🔧 **Configurable bind address** — `BIND_ADDRESS` env var (defaults to `0.0.0.0`) replaces hardcoded Docker bridge IP
- 🔧 **Configurable port in compose** — `PORT` env var now drives both the container and host port mapping
- 📝 **`.env.example`** — added with all configurable environment variables documented

---

## 🏷️ v0.1.0 — 2026-03-09

### ✨ Features

- 🏠 **Landing Page** — informative public-facing page explaining what the app does, with an SVG flow diagram, feature cards, and links to the GitHub repository
- 🔐 **Sign-in Overlay** — login form now appears as a smooth overlay on the landing page instead of a bare dialog
- 🎨 **Consistent Light Theme** — landing page uses Bootstrap's default light theme to match the logged-in dashboard

---

## 🏷️ v0.0.1 — 2026-03-09

### ✨ Features

- 🔀 **Git Task Fan Out Routing** — receive webhooks on unique URLs and forward to multiple targets in parallel
- 🔐 **Authentication** — bcrypt + pepper password hashing, iron-session cookies, first-run admin registration
- 🔑 **Password Management** — change password from the UI
- 🛡️ **Signature Verification** — supports GitHub (`X-Hub-Signature-256`), Gitea (`X-Gitea-Signature`), and GitLab (`X-Gitlab-Token`)
- 🔁 **Automatic Retries** — up to 3 attempts with backoff (500ms, 1500ms) on 5xx / network errors
- 📡 **Ping / Test** — ping button in the UI to verify target reachability before going live
- 📋 **Duplicate Routes** — clone an existing route with one click
- 📝 **Route Descriptions** — optional description field to document what each route is for
- 🏥 **Health Endpoint** — `GET /api/health` returns version, uptime, and status for Docker / load balancer probes
- 📊 **Morgan Logging** — pretty colorized request logs in dev, structured logs in production
- 🎨 **Bootstrap Theming** — SCSS variable overrides at build time, optional runtime CSS override via `data/theme.css`
- 🚫 **Rate Limiting** — IP-based anti-bruteforce on login/register (10 attempts per 15 min window)
- 🐳 **Docker Support** — Dockerfile + docker-compose.yml with health checks and volume mounts
- 💾 **INI Config** — all config stored as flat INI files in `data/` directory (routes, users, auth pepper). Note: file-based storage has no locking mechanism; this is by design for a single-admin deployment. Do not run multiple instances writing to the same `data/` directory concurrently.
