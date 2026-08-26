# agentlet

Tiny kit for a **cheap, quick agent web app** — Eve companion + JSON (+ markdown) on Blob / R2 / local.

**Direction (locked):** this product is **agentlet**. Do not re-litigate. Read `.backlog/memory.md` and `.backlog/prds/PRD-agentlet.md` before changing docs, scaffold, or UI. Execution: `.backlog/plans/PLAN-agentlet.md`.

## Architecture

- **Storage:** `files-sdk` adapters — Vercel Blob (default), Cloudflare R2, or local `./data`
- **State:** JSON files under `STORAGE_PREFIX` (seed demo: `notes.json`) via `src/lib/json-store.ts` + domain modules
- **Agent:** `agent/` Eve tools — `list_notes`, `get_note`, `add_note`, `update_note`

## When to use which skill

| User intent | Skill |
| --- | --- |
| Link Vercel + AI Gateway so Companion works (OIDC pull); optional deploy | `.agents/skills/provision-vercel` |
| Create Blob store / switch to R2 or local | `.agents/skills/provision-storage` |
| Add a new entity | Add a JSON module under `src/lib/` + domain tools; seed via `ensureSeeded` / missing-key fallback |

`provision-vercel` Definition of Done = linked project + Gateway creds (`VERCEL_OIDC_TOKEN` via `vercel env pull`, or `AI_GATEWAY_API_KEY`) + `GET /api/notes` + `/eve/v1/health`. It does **not** include machine-specific HTTPS (Caddy / `*.mgl.dev` / portless).

## Local

```bash
cp .env.example .env.local
# STORAGE_BACKEND=local for zero-cloud, or vercel/r2 with credentials
npm install
# Companion needs Gateway: ask agent for provision-vercel (vercel link + env pull)
npm run dev
```

This checkout is the notes app. See root [README.md](README.md).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
