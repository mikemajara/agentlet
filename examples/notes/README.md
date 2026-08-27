# agentlet notes

Self-contained Eve notes app. JSON files on Vercel Blob / R2 / local `./data`.

```bash
cp .env.example .env.local
# STORAGE_BACKEND=local for zero-cloud
npm install
npm run dev
```

Companion needs AI Gateway: `.agents/skills/provision-vercel`.

After clone, reshape notes into your domain: `.agents/skills/reshape-domain` (not a substitute for provision skills).

Smoke: `GET /api/notes` (or your domain list route after reshape) and `GET /eve/v1/health`.
