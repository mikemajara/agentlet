# agentlet notes

Self-contained Eve notes app — the **Deploy Button** target. JSON files on **private** Vercel Blob (default), R2, or local `./data`.

## Production (Deploy)

1. Deploy from the [root README Deploy button](https://github.com/mikemajara/agentlet#your-first-10-minutes-deploy) — clones **only** this folder into your **private** GitHub repo (not the whole catalog repo).
2. Open the site — Vercel Authentication; same Vercel account you used to Deploy.
3. Talk to the companion (AI Gateway OIDC on the server — not user login).
4. **Allow this app to edit its own code** in-app ([#16](https://github.com/mikemajara/agentlet/issues/16)) — no PAT, no Vercel Connect for this grant.
5. Ask the companion to reshape the app ([#14](https://github.com/mikemajara/agentlet/issues/14)).

Living lock: [`.backlog/memory.md`](../../.backlog/memory.md).

## Local (developers)

```bash
cp .env.example .env.local
# STORAGE_BACKEND=local for zero-cloud
npm install
npm run dev
```

Companion needs AI Gateway: `.agents/skills/provision-vercel`.

**Developer/local only:** `.agents/skills/reshape-domain` (closed [#2](https://github.com/mikemajara/agentlet/issues/2)) reshapes notes on your machine via a coding agent — **not** the production happy path after Deploy.

Before a Deploy Button click, same checks Vercel runs:

```bash
npm test && npm run build
```

Smoke: `GET /api/notes` (or your domain list route after reshape) and `GET /eve/v1/health`.
