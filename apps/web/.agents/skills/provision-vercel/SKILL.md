---
name: provision-vercel
description: >-
  Link the agentlet catalog app to a Vercel project and make the Eve companion
  agent-ready locally (AI Gateway via OIDC). Also use when deploying this site.
---

# Provision Vercel (catalog)

## Goal / Definition of Done

From `apps/web`:

1. `.vercel/` exists (project linked)
2. `.env.local` has **either** a non-empty `VERCEL_OIDC_TOKEN` (preferred) **or** `AI_GATEWAY_API_KEY`
3. `npm run dev` serves the app (port `3000`)
4. Smoke: `GET /api/catalog` and `GET /eve/v1/health` succeed
5. Companion can start a session

**Out of scope:** Caddy, `*.mgl.dev`, portless. Catalog listings are git — do not provision Blob for this app.

## Steps

### 1. Auth

```bash
printenv VERCEL_TOKEN >/dev/null || npx vercel whoami
```

### 2. Link

From `apps/web`:

```bash
npx vercel link --yes --project agentlet
```

Set the Vercel project Root Directory to `apps/web` when this GitHub repo is the production site.

### 3. Eve / AI Gateway

```bash
npx vercel env pull .env.local --yes
```

Fallback: `AI_GATEWAY_API_KEY` from https://vercel.com/dashboard/ai/api-keys

### 4. Smoke

```bash
npm run dev
curl -sS "http://127.0.0.1:3000/api/catalog" | head -c 400
curl -sS "http://127.0.0.1:3000/eve/v1/health"
```

### 5. Deploy (only if requested)

```bash
npx vercel deploy -y --no-wait
```
