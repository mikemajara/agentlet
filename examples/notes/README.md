# agentlet notes

Self-contained Eve notes app. JSON files on Vercel Blob / R2 / local `./data`.

```bash
cp .env.example .env.local
# STORAGE_BACKEND=local for zero-cloud
npm install
npm run dev
```

Companion needs AI Gateway: `.agents/skills/provision-vercel`.

Smoke: `GET /api/notes` and `GET /eve/v1/health`.
