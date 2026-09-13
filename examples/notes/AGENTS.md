# agentlet notes

Eve companion + JSON files on Blob / R2 / local.

## Skills

| User intent | Skill |
| --- | --- |
| Link Vercel + AI Gateway so Companion works (OIDC pull); optional deploy | `.agents/skills/provision-vercel` |
| Create Blob store / switch to R2 or local | `.agents/skills/provision-storage` |
| Turn notes into the user's domain on a laptop (new JSON + tools + UI) | `.agents/skills/reshape-domain` (local/dev only — closed #2; production reshape is Allow #16 + companion #14) |

`provision-vercel` Definition of Done = linked project + Gateway creds (`VERCEL_OIDC_TOKEN` via `vercel env pull`, or `AI_GATEWAY_API_KEY`) + domain list `GET` (default `/api/notes`) + `/eve/v1/health`. It does **not** include machine-specific HTTPS (Caddy / `*.mgl.dev` / portless).

## Local

```bash
cp .env.example .env.local
npm install
npm run dev
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
