# 📋 Changelog

All notable changes to this project will be documented in this file.

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
