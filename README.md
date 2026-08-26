# agentlet

A tiny kit for a cheap, quick **agent web app**. Talk to an [Eve](https://eve.computer) companion; **JSON files** on object storage are the database.

- **Eve** companion (`agent/`) with domain tools over notes JSON
- **files-sdk** storage: **Vercel Blob (default)**, Cloudflare R2, or local `./data`
- **JSON (+ markdown)** for durable state — typed helpers, not SQL
- **Agent skills** under `.agents/skills/` to provision Vercel + storage

## Quick start

This checkout **is** the notes app.

```bash
cp .env.example .env.local
# STORAGE_BACKEND=local for zero-cloud, or vercel/r2 with credentials
npm install
npm run dev
```

Companion needs AI Gateway: point an agent at `.agents/skills/provision-vercel` (`vercel link` + `vercel env pull`).

Seed demo state: `{STORAGE_PREFIX}/notes.json`.

## Storage

| `STORAGE_BACKEND` | Credentials |
| --- | --- |
| `vercel` (default) | `BLOB_READ_WRITE_TOKEN` or OIDC + Blob store |
| `r2` | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` |
| `local` | none — files under `./data/{STORAGE_PREFIX}/` |

If cloud credentials are missing, the app **falls back to local** so development works immediately.

## Agent provisioning

Point Cursor (or another coding agent) at:

- `.agents/skills/provision-vercel` — **link + `vercel env pull` (OIDC)** so Companion has AI Gateway; deploy only if asked
- `.agents/skills/provision-storage` — Blob / R2 / local setup

Machine-specific HTTPS (Caddy / `*.mgl.dev`) is **not** part of these skills.

See [AGENTS.md](./AGENTS.md).

## Scripts

```bash
npm run dev     # http://localhost:3460
npm run build
npm start
```
