# agentlet

A **private personal tool**: Deploy a tiny Eve notes app, talk to the companion, Allow GitHub write in-app, then ask the agent to change the app into yours (tasks, recipes, inventory, …). Same pattern everywhere: companion top right, a list in the center, JSON files as state.

**Not v1:** a public catalog-first marketplace or extra listings. The catalog in [`apps/web`](./apps/web) is distribution later ([#10](https://github.com/mikemajara/agentlet/issues/10)); [#9](https://github.com/mikemajara/agentlet/issues/9) is done history.

Living product lock: [`.backlog/memory.md`](./.backlog/memory.md). **v1 is done when [#17](https://github.com/mikemajara/agentlet/issues/17) passes** (fresh GitHub + Vercel journey).

## Your first 10 minutes (Deploy)

You need a **GitHub** account and a **Vercel** account linked to GitHub (“Continue with GitHub”). No terminal required.

1. **Deploy** — button below clones **only** [`examples/notes`](./examples/notes) into **your private** GitHub repo, provisions **private** Blob storage, and creates a Vercel project. It does **not** clone this whole catalog repo. Do **not** use GitHub “Use this template” on `mikemajara/agentlet`.
2. **Open the site** — Vercel Authentication protects **all** deployments (Hobby). Sign in with the **same Vercel account** you used to Deploy. There is no users table and no app password. The site is **not** a public URL anyone can chat on.
3. **Talk** — use the companion. Production models use AI Gateway via OIDC (server→models). That is **not** user login; you do not paste a model API key on the happy path.
4. **Allow** — in the app, **Allow this app to edit its own code** (GitHub create-app + install on this one repo). No personal access token. No Vercel Connect dashboard for this grant. Implementation: [#16](https://github.com/mikemajara/agentlet/issues/16).
5. **Ask** — tell the companion what you want (e.g. “turn this into a task manager”). It changes the app; git on the default branch updates; Vercel redeploys. Implementation: [#14](https://github.com/mikemajara/agentlet/issues/14).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmikemajara%2Fagentlet%2Ftree%2Fmain%2Fexamples%2Fnotes&project-name=agentlet-notes&repository-name=agentlet-notes&stores=%5B%7B%22type%22%3A%22blob%22%2C%22access%22%3A%22private%22%7D%5D)

**Do not:** paste PATs or tokens into chat or env forms as the happy path; use Vercel Connect for the GitHub write grant; deploy the catalog repo instead of the notes example.

## Terminal (developers only)

```bash
npx create-next-app@latest my-app -e https://github.com/mikemajara/agentlet/tree/main/examples/notes
cd my-app
cp .env.example .env.local
npm install
npm run dev
```

`STORAGE_BACKEND=local` in `.env.local` runs without cloud credentials. Companion still needs Gateway: point an agent at `.agents/skills/provision-vercel`.

**Local reshape only:** `.agents/skills/reshape-domain` (closed [#2](https://github.com/mikemajara/agentlet/issues/2)) is for coding agents on your machine — **not** the production happy path after Deploy. Production changes go through Allow ([#16](https://github.com/mikemajara/agentlet/issues/16)) + companion ([#14](https://github.com/mikemajara/agentlet/issues/14)).

## Catalog site (this repo, later)

[`apps/web`](./apps/web) is the future marketplace agentlet — browse, tag filters, Deploy one listing. Not the user’s first-run path. Catalog rows live in [`apps/web/catalog.json`](./apps/web/catalog.json) (git). Vercel Root Directory: `apps/web`.

```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

Smoke: `GET /api/catalog` and `GET /eve/v1/health`.
