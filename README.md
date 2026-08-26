# agentlet

A tiny kit for a cheap, quick **agent web app**. Talk to an [Eve](https://eve.computer) companion; **JSON files** on object storage are the database.

First example: **notes** — Eve tools over `notes.json` on Vercel Blob (default), R2, or local `./data`.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmikemajara%2Fagent-files%2Ftree%2Fmain%2Fexamples%2Fnotes&project-name=agentlet-notes&repository-name=agentlet-notes&stores=%5B%7B%22type%22%3A%22blob%22%7D%5D)

Clones only [`examples/notes`](./examples/notes) into your GitHub repo and offers a Blob store in the same flow. Production Companion uses AI Gateway via OIDC.

## Terminal

```bash
npx create-next-app@latest my-app -e https://github.com/mikemajara/agent-files/tree/main/examples/notes
cd my-app
cp .env.example .env.local
npm install
npm run dev
```

`STORAGE_BACKEND=local` in `.env.local` runs without cloud credentials. Companion still needs Gateway: point an agent at `.agents/skills/provision-vercel`.

## Local (this repo)

```bash
cd examples/notes
cp .env.example .env.local
npm install
npm run dev
```

Smoke: `GET /api/notes` and `GET /eve/v1/health`.
