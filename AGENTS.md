# agentlet

Free catalog of **tiny, cheap, deployable agent web apps** that share one pattern: Eve companion (top right), a list in the center, JSON (+ markdown) on object storage, Deploy Button / `create-next-app -e` into **one** example folder.

The GitHub repo is that catalog plus the examples. The public site is itself an agentlet. GitHub: `mikemajara/agentlet`. Not an npm `create-*` product.

**Do not re-litigate the name or the pattern.** Read `.backlog/memory.md` before changing docs, scaffold, or UI. Kit first cut (done): `.backlog/prds/PRD-agentlet.md`. v1 site: `.backlog/prds/PRD-marketplace.md` and GitHub #9.

Do not teach GitHub “Use this template” on this whole repository.

## v1 (locked)

Ship **discovery**, not a platform and not a pile of extra examples.

**In**

- Marketplace web app as an agentlet at [`apps/web`](./apps/web) (browse, tag filters, companion, Deploy / clone one listing).
- Catalog in **git**: [`apps/web/catalog.json`](./apps/web/catalog.json). Maintainer listings only. Add an example = `examples/<name>` folder + a catalog row.
- First listing: [`examples/notes`](./examples/notes). Examples stay self-contained Next.js apps (`package.json`, `agent/`, provision skills). No workspace packages Deploy Button would miss.
- Same stack: Eve + `files-sdk` + shadcn neutral/zinc. Cheap Hobby Vercel + Blob + Gateway.

**Out (do not start unless a later issue says so)**

- Package monorepo / shared `src` across examples.
- Accounts, paid listings, public submit-to-catalog.
- Marketplace as OAuth / “connect your tools” hub (that lives on the user’s deployed instance).
- Extra showcases as v1 work: NYC taxi (#8), hotel/clinic inbox, self-modification.
- A maintained create CLI.

Until the catalog is the deployed index, the README still also links `examples/notes` directly. The site lives in `apps/web`; examples stay independently deployable. Do not introduce workspace packages.

## Architecture (the pattern)

- **Catalog site:** [`apps/web`](./apps/web) — listings from `catalog.json` (git). Tools: `list_agentlets`, `get_agentlet`.
- **Examples:** self-contained Next apps under `examples/*`.
- **Storage (examples):** `files-sdk` — Vercel Blob (default), Cloudflare R2, or local `./data`
- **State (examples):** JSON files under `STORAGE_PREFIX` via `src/lib/json-store.ts` + domain modules
- **Agent:** `agent/` Eve tools — `list_*` / `get_*` / `add_*` / `update_*` for that domain

Provision skills ship **inside each app** (catalog: `provision-vercel`; notes: `provision-vercel`, `provision-storage`, `reshape-domain`).
