# agentlet

Free catalog of tiny, cheap **agent web apps**. Same pattern: [Eve](https://eve.computer) companion (top right), a list in the center, JSON files as state, Deploy Button / `create-next-app -e` into **one** example folder.

The public site is [`apps/web`](./apps/web) — itself an agentlet. Listings live in [`apps/web/catalog.json`](./apps/web/catalog.json).

First listing: **notes** — Eve tools over `notes.json` on Vercel Blob (default), R2, or local `./data`.

## Deploy an example

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmikemajara%2Fagentlet%2Ftree%2Fmain%2Fexamples%2Fnotes&project-name=agentlet-notes&repository-name=agentlet-notes&stores=%5B%7B%22type%22%3A%22blob%22%7D%5D)

Clones only [`examples/notes`](./examples/notes) into your GitHub repo and offers a Blob store in the same flow. Production Companion uses AI Gateway via OIDC.

## Terminal

```bash
npx create-next-app@latest my-app -e https://github.com/mikemajara/agentlet/tree/main/examples/notes
cd my-app
cp .env.example .env.local
npm install
npm run dev
```

`STORAGE_BACKEND=local` in `.env.local` runs without cloud credentials. Companion still needs Gateway: point an agent at `.agents/skills/provision-vercel`. After clone, reshape notes into your domain with `.agents/skills/reshape-domain`.

## Catalog site (this repo)

Vercel Root Directory: `apps/web`. Catalog is git; no Blob store required for listings.

```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

Smoke: `GET /api/catalog` and `GET /eve/v1/health`.
