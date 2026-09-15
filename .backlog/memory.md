# Backlog Memory

## Changelog

- **2026-09-13:** Root living docs relocked to self-drive v1 (Deploy → talk → Allow → companion changes app) via GitHub [#15](https://github.com/mikemajara/agentlet/issues/15). README, AGENTS, notes README, PRD/plan banners, repo description.
- **2026-09-13:** [#16](https://github.com/mikemajara/agentlet/issues/16) GitHub App manifest Allow in `examples/notes` (private Blob, grant JSON on object storage, preview/local cannot complete Allow). [#14](https://github.com/mikemajara/agentlet/issues/14) companion git write via installation token on production after grant. [#17](https://github.com/mikemajara/agentlet/issues/17) still needs a human fresh-account pass.
- **2026-09-13:** Parked in-app GitHub Allow / companion reshape as the *next* slice. First working bar is Deploy Button → Vercel site actually loads (notes + companion). Allow UI is off unless `ENABLE_GITHUB_ALLOW=true`. Blob adapter retries public if the store rejects private access so a default Deploy store does not 500 the homepage.
- **2026-09-13:** Happy path is Deploy → open the site. No Storage-tab / “connect Blob then redeploy” instructions. Notes adapter calls `@vercel/blob` and lets the SDK resolve OIDC + `BLOB_STORE_ID` / token at request time (do not throw before the SDK). Deploy clones are a snapshot of `examples/notes` at click time; an already-cloned repo does not pick up later template commits.
- **2026-09-14:** **Checkpoint `checkpoint-deploy-notes`.** Human Deploy (existing GitHub + Vercel) of current `examples/notes`: clone, typecheck/`next build`, site loads, notes + companion. GitHub Allow UI stays parked (`ENABLE_GITHUB_ALLOW`). #17/#16/#14 were closed with PR #18; that close is **not** this checkpoint and is **not** the fresh-account journey. Do not regress Deploy→load to chase Allow.
- **2026-09-15:** Human test (existing GitHub + Vercel): Deploy/Blob OK; git reshape OK **after** Allow. Failures: companion silent when write denied; GitHub install friction (pick repo); Allow prompt after an app was already installed. Now-bar: #16 + #14 together (unpark Allow, one App, speak on deny), then #19 todos as first-run product. Do not start #8/#10/#12/#13. #17 stays blocked on that composition.

## Checkpoint (locked 2026-09-14)

Git tag **`checkpoint-deploy-notes`** on `main`. Template SHA at lock: see that tag.

**In (do not regress)**

- Deploy Button clones **only** `examples/notes`, requests private Blob (`stores=[{type:blob,access:private}]`).
- Production `next build` typechecks. Tests are excluded from that graph; `cd examples/notes && npm test && npm run build` is the pre-click check (GitHub Actions `notes` on template changes).
- Open the deployment: notes list seeds, companion is there. No Storage-tab / paste-token happy path. `@vercel/blob` auth at request time (OIDC + store id and/or token).
- GitHub Allow UI off unless `ENABLE_GITHUB_ALLOW=true`.

**Out of the checkpoint (now-bar after 2026-09-15 test, do not regress Deploy to do these)**

- Unpark Allow and make the GitHub grant one App + speak on deny ([#16](https://github.com/mikemajara/agentlet/issues/16), [#14](https://github.com/mikemajara/agentlet/issues/14)).
- First-run list is todos ([#19](https://github.com/mikemajara/agentlet/issues/19)).
- Brand-new GitHub + Vercel pair composing the full journey ([#17](https://github.com/mikemajara/agentlet/issues/17)).
- Catalog go-live ([#10](https://github.com/mikemajara/agentlet/issues/10)).

## Decisions

- **Product name: agentlet** (locked 2026-08-26). GitHub: `mikemajara/agentlet`. Not an npm `create-*` product.

- **What it is (v1, relocked 2026-09-12; privacy 2026-09-13):** a **private personal tool**. Someone with GitHub + Vercel Deploys the notes template, talks to the companion, Allows GitHub write in-app, then the companion can change **that** app. GitHub clone is **private**. The website is **not** a public URL anyone can chat on. They never paste a token, open Developer settings, or use Vercel Connect for this grant.

- **Login vs “database” (locked 2026-09-13):**
  - **AI Gateway / OIDC** authenticates the **server** to models. It is not user login.
  - **Who may open the site:** Vercel Authentication on **all deployments** (Hobby, no extra paid add-on as of 2026-09-09). Visitor signs in with the **same Vercel account** they used to Deploy. No users table, no app passwords, no new identity product.
  - **List data** stays JSON on **private** Blob (or R2 / local). Not a user DB.
  - Git write on an unauthenticated public URL is **rejected**. Private GitHub without protecting the Vercel URL is **not** enough (the site would still be world-chatable).

- **Not v1 (relock):** a catalog-first marketplace, extra listings (taxi #8, hotel #12, clinic #13), a hosted agentlet platform, a maintainer-operated GitHub App / token broker, Vercel Connect as the first-run grant, fine-grained or classic PATs, `reshape-domain` as the *production* path (that skill stays for local/coding-agent only; closed #2).

- **How people get an app** (no custom CLI):
  1. **Primary:** Vercel Deploy Button — clone only the notes example into *their* **private** GitHub repo, **private** Blob, Vercel Authentication on all deployments. Production chat via AI Gateway OIDC (no model key to paste).
  2. **Then:** in-app **Allow this app to edit its own code** — GitHub’s create-an-app + install-on-this-one-repo screens (manifest-style). No PAT. No Connect dashboard.
  3. **Then:** they ask the companion to turn the app into their tool (e.g. task manager). The companion changes the app; git on the default branch updates; Vercel redeploys.
  4. **Terminal (developers only):** `create-next-app -e` on the notes example. GitHub write is not required locally. Local reshape remains the closed #2 skill.

- **GitHub write:** Vercel’s GitHub App (from Deploy) can *pull* and redeploy. It cannot be used by the companion to *push*. A **second** GitHub App, created on the *user’s* account from the live site, is the writer. Scoped to **one repo** (the clone). After Allow, no further GitHub permission screens for ordinary changes.

- **Catalog (`apps/web`, #9 closed, #10):** distribution later, not the user’s first 10 minutes. Do not block self-drive on a public catalog URL.

- **Stack (unchanged):** Eve + JSON files on object storage + domain tools + provision skills. shadcn neutral/zinc. Cheap Hobby Vercel + Blob + Gateway.

- **Durable domain state:** JSON (+ markdown) on Blob / R2 / local `./data`. Domain tools `list_*` / `get_*` / `add_*` / `update_*`. Code changes are git; list data stays on object storage unless the agent migrates it.

- **Removed** `packages/create-agent-files`. Extra showcases and DuckDB still not the default starter.

- **UI:** shadcn, neutral/zinc, no cream/green branded theme.

- **Historical:** first kit `.backlog/prds/PRD-agentlet.md`; catalog `.backlog/prds/PRD-marketplace.md` + #9. Those describe a *prior* v1. Current lock is this file + GitHub issues #15, #16, #14. **v1 is done when #17 passes** (fresh GitHub + Vercel journey).

## Blockers

- GitHub slug is `mikemajara/agentlet`. Deploy Button and `-e` URLs use that slug.

## Project Conventions

- Storage adapters: Vercel Blob / R2 / local `./data` via `getStorage()`.
- JSON helpers: `readJsonFile` / `writeJsonFile` / `updateJsonFile`.
- Agent tools are domain-specific, not generic SQL.
- Provision smoke: domain list route + `/eve/v1/health`.
- Each example is a **self-contained** Next.js app. No workspace packages that Deploy Button would miss.

## Gotchas

- Concurrent JSON writes: last-write-wins; in-process lock only. Git commits can race the same way if two turns write at once — last push wins.
- `next build` typechecks `tsconfig` includes. Keep `**/*.test.ts` out of that config; `npm test && npm run build` in `examples/notes` is the same TypeScript pass Vercel runs — use it instead of deleting GitHub clones.
- Deploy-to-Vercel needs GitHub + Vercel. Blob + Gateway are cheap, not $0 forever. Local Companion still needs `vercel link` + `env pull`.
- Name collision note (non-blocking): “agentlet” appears in a Substack essay and a tiny PyPI stub. We are using it anyway.
- Clones used to copy whole GitHub `main` via `create-agent-files`. Now Deploy / `-e` clone the notes example only.
- Self-mod was explicitly “not v1” until 2026-09-12. Ignore that sentence in older PRDs.
- Hobby **password** protection is not the path. Vercel Authentication is. Production protection on all deployments is free on Hobby as of 2026-09-09; do not assume the old “production stays public on Hobby” docs.
