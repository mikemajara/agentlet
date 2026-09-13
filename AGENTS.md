# agentlet

**Private personal tool** pattern: Eve companion (top right), a list in the center, JSON (+ markdown) on object storage, Deploy Button / `create-next-app -e` into **one** example folder.

GitHub: `mikemajara/agentlet`. Not an npm `create-*` product.

**Do not re-litigate the name or the pattern.** Read [`.backlog/memory.md`](./.backlog/memory.md) before changing docs, scaffold, or UI. Older PRDs (`.backlog/prds/PRD-agentlet.md`, `.backlog/prds/PRD-marketplace.md`) and [#9](https://github.com/mikemajara/agentlet/issues/9) describe a **prior** catalog-first v1 — historical only.

Do not teach GitHub “Use this template” on this whole repository.

## v1 (locked — relock 2026-09-12)

Ship **self-drive**, not a catalog-first marketplace and not a pile of extra examples. **v1 is done when [#17](https://github.com/mikemajara/agentlet/issues/17) passes.**

**In**

- **Primary path:** Vercel Deploy Button clones **only** [`examples/notes`](./examples/notes) into the user’s **private** GitHub repo, **private** Blob, Vercel Authentication on **all** deployments. Owner signs in with the **same Vercel account** they used to Deploy (no users table, no app passwords).
- **Talk:** companion via AI Gateway OIDC (server→models — **not** user login).
- **Allow:** in-app **Allow this app to edit its own code** — GitHub create-app + install-on-this-one-repo (manifest-style). No PAT. No Vercel Connect for this grant. Implementation: [#16](https://github.com/mikemajara/agentlet/issues/16).
- **Change the app:** companion modifies git on the default branch; Vercel redeploys. Implementation: [#14](https://github.com/mikemajara/agentlet/issues/14).
- First example: [`examples/notes`](./examples/notes). Self-contained Next.js apps (`package.json`, `agent/`, provision skills). No workspace packages Deploy Button would miss.
- Same stack: Eve + `files-sdk` + shadcn neutral/zinc. Cheap Hobby Vercel + Blob + Gateway.

**Out (do not start unless a later issue says so)**

- Catalog go-live as v1 ([#10](https://github.com/mikemajara/agentlet/issues/10)); marketplace app at [`apps/web`](./apps/web) exists but is **later**, not the user’s first 10 minutes ([#9](https://github.com/mikemajara/agentlet/issues/9) done/historical).
- Package monorepo / shared `src` across examples.
- Accounts, paid listings, public submit-to-catalog.
- Extra showcases as v1 work: NYC taxi ([#8](https://github.com/mikemajara/agentlet/issues/8)), hotel/clinic inbox, more catalog rows.
- Maintainer-operated GitHub App / token broker; fine-grained or classic PATs as the happy path.
- `reshape-domain` as the **production** path (closed [#2](https://github.com/mikemajara/agentlet/issues/2) — **developer/local** only).
- A maintained create CLI.

Examples stay independently deployable. Do not introduce workspace packages.

## Architecture (the pattern)

- **Catalog site (later):** [`apps/web`](./apps/web) — listings from `catalog.json` (git). Tools: `list_agentlets`, `get_agentlet`.
- **Examples:** self-contained Next apps under `examples/*`.
- **Storage (examples):** `files-sdk` — Vercel Blob (default), Cloudflare R2, or local `./data`
- **State (examples):** JSON files under `STORAGE_PREFIX` via `src/lib/json-store.ts` + domain modules
- **Agent:** `agent/` Eve tools — `list_*` / `get_*` / `add_*` / `update_*` for that domain

Provision skills ship **inside each app** (catalog: `provision-vercel`; notes: `provision-vercel`, `provision-storage`, `reshape-domain` for local/dev only).
