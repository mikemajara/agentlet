# agentlet catalog

Public agentlet site. Listings come from git-committed `catalog.json`. Eve companion top-right.

This app is **not** cloned by the notes Deploy Button. Vercel Root Directory for this repo’s site is `apps/web`.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Companion needs AI Gateway: `.agents/skills/provision-vercel`.

Smoke: `GET /api/catalog` and `GET /eve/v1/health`.

Add an example: ship a self-contained app under `examples/<name>`, then add a row to `catalog.json`.
