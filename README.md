# 🔀 Git Task Fan Out

A lightweight webhook router that receives incoming webhooks on unique endpoints and fans them out to multiple destinations in parallel. Designed for self-hosted Git platforms (Gitea, GitLab) with signature verification support for those platforms and GitHub. It forwards raw requests (headers + body) so it may work with other webhook sources too, but that's not tested or officially supported.

**📋 [Changelog](docs/changelog.md)**

---

## 🤔 Why?

- 🔗 **Single ingress point** — expose one webhook URL instead of many
- 📡 **Fan out to multiple targets** — CI, chat notifications, monitoring, etc. all from one hook
- 🏠 **Configure routing outside your Git host** — no need to add N webhooks per repo
- 🔒 **Keep internal services private** — only the fanout server needs to be reachable

## 🚀 Quick Start

### With Docker Compose

```bash
# Clone and start
git clone https://github.com/Xalior/GitTaskFanOut.git && cd GitTaskFanOut
docker compose up -d

# Open http://localhost:6175 — register an admin account on first run
```

### Without Docker

```bash
# Prerequisites: Node.js 22+, pnpm
pnpm install
pnpm dev        # development (http://localhost:6175)
pnpm build && pnpm start   # production
```

## ⚙️ Configuration

All config lives in the `data/` directory as INI files:

| File | Purpose |
|------|---------|
| `routes.ini` | Webhook routes (managed via UI) |
| `users.ini` | Admin user accounts (created via UI) |
| `auth.ini` | Optional pepper for password hashing |
| `theme.css` | Optional runtime CSS theme override |

### 🔑 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SESSION_SECRET` | dev default | Session encryption key (min 32 chars) |
| `AUTH_PEPPER` | _(none)_ | Appended to passwords before bcrypt hashing |
| `PORT` | `6175` | Server listen port |
| `NODE_ENV` | `development` | Set to `production` for prod |
| `BIND_ADDRESS` | `0.0.0.0` | Docker host bind IP (e.g. `172.17.0.1` to restrict to Docker bridge) |
| `SMTP_URL` | _(none)_ | SMTP connection URL for password reset emails |
| `SMTP_FROM` | `noreply@localhost` | From address for password reset emails |

### 🔒 Password Pepper

Set via `AUTH_PEPPER` env var (recommended) or in `data/auth.ini`:

```ini
[_meta]
pepper = your-random-string-here
```

## 📡 How It Works

1. 🆕 **Create a route** in the UI — give it a name, add target URLs
2. 📋 **Copy the webhook URL** — e.g. `/api/hooks/a1b2c3d4e5f6g7h8`
3. 🔗 **Configure your Git host** to send webhooks to that URL
4. 🔀 **Incoming webhooks** are forwarded to all targets in parallel
5. 🔁 **Failed targets** are retried up to 3 times with backoff

### 🛡️ Signature Verification

If a secret is configured on a route, incoming webhooks are verified:

- **GitHub** — `X-Hub-Signature-256` (HMAC-SHA256)
- **Gitea** — `X-Gitea-Signature` (HMAC-SHA256)
- **GitLab** — `X-Gitlab-Token` (plain token comparison)

## 🏥 Health Check

```bash
curl http://localhost:6175/api/health
# → {"status":"ok","version":"0.1.0","uptime":1234,"startedAt":"..."}
```

Used by the Docker Compose health check and compatible with any load balancer or monitoring system.

## 🎨 Theming

### Build-time (SCSS)

Override Bootstrap variables in `webapp/src/styles/_variables.scss` and add custom styles in `_custom.scss`. Rebuild to apply.

### Runtime (CSS)

Drop a compiled CSS file (e.g. from [Bootswatch](https://bootswatch.com)) into `data/theme.css`. It loads on top of the built-in theme — no rebuild needed. Remove the file to revert.

## 🔐 Security

- 🔑 Passwords hashed with bcrypt (12 rounds) + optional pepper
- 🍪 HTTP-only session cookies (iron-session)
- 🚫 IP-based rate limiting on login/register (10 attempts / 15 min)
- ✅ Webhook signature verification (GitHub, Gitea, GitLab)
- 🔒 All route management APIs require authentication
- 📡 Webhook ingress endpoints are unauthenticated (as expected by Git platforms)

## 📁 Project Structure

```
GitTaskFanOut/
├── docker-compose.yml
├── data/                    # Config directory (gitignored)
│   ├── routes.ini
│   ├── users.ini
│   └── auth.ini
└── webapp/                  # Next.js app
    ├── Dockerfile
    ├── server.ts            # Custom server with morgan logging
    └── src/
        ├── lib/             # Config, auth, relay, session, rate limiting
        ├── styles/          # SCSS theme files
        └── pages/
            ├── index.tsx    # React-Bootstrap UI
            └── api/
                ├── health.ts
                ├── theme.css.ts
                ├── auth/    # login, logout, register, change-password, status
                ├── hooks/   # [...slug].ts — webhook receiver
                └── routes/  # CRUD + ping + duplicate
```

## 📜 License

LGPL-3.0 — see [LICENSE](LICENSE)
