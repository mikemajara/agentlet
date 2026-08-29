# Backlog Memory

## Decisions

- **Product name: agentlet** (locked 2026-08-26). GitHub: `mikemajara/agentlet`. Not an npm `create-*` product.
- **What it is (v1, locked 2026-08-28):** a **free catalog** of tiny, cheap, deployable agent web apps that share one pattern (Eve companion top-right, list in the center, JSON on object storage, Deploy Button / `create-next-app -e` into one example folder). The public site is itself an agentlet. GitHub #9. Umbrella: `.backlog/prds/PRD-marketplace.md`. Mission: `AGENTS.md`.
- **Stack (unchanged):** Opinionated (Eve + JSON files on object storage + domain tools + provision skills). Unopinionated look (shadcn neutral/zinc). Cheap (Hobby Vercel + Blob + Gateway at this volume).

- **Durable state:** JSON (+ markdown) on Vercel Blob / R2 / local `./data`. Domain tools (`list_*` / `get_*` / `add_*` / `update_*`). Seed: `{STORAGE_PREFIX}/notes.json`.
- **How people get an app** (no custom CLI):
  1. **Primary:** Vercel Deploy Button — clone only `examples/notes` into their GitHub repo, provision Blob in the same flow (`stores=[{"type":"blob"}]`). Production Companion via AI Gateway OIDC.
  2. **Terminal:** `npx create-next-app my-app -e https://github.com/mikemajara/agentlet/tree/main/examples/notes` (create-next-app, not our CLI).
  3. **Prompt/skill:** after clone/deploy, shape the notes app into theirs. GitHub #2. Skill: `examples/notes/.agents/skills/reshape-domain`.
- **Removed** `packages/create-agent-files`. Path is Deploy Button + `create-next-app -e` on `examples/notes`.
- **Examples:** first listing is `examples/notes`. Extra showcases are **not v1** (NYC taxi #8, hotel/clinic inbox, self-modification). DuckDB stays isolated to specialized examples and does not return to the default starter.
- **v1 catalog:** `apps/web` is the public site. `apps/web/catalog.json` is the source of truth. Maintainer-authored only. Not a package monorepo. Not an accounts / OAuth / submit-to-catalog platform. Layout decision (2026-08-28, #9): `apps/web` + `examples/*`, not a root Next app and not per-example `agentlet.json`.
- **Self-modification:** not v1. Clone-into-their-GitHub is the foundation.
- **UI:** shadcn, neutral/zinc, no cream/green branded theme.
- **Living docs** describe the locked v1 in `AGENTS.md`. Do not reintroduce DuckDB, CSV catalogs, or `run_sql` into the core notes starter. Historical kit plan: `.backlog/plans/PLAN-json-file-state.md` (archived). First-cut kit: `.backlog/prds/PRD-agentlet.md` + `.backlog/plans/PLAN-agentlet.md`. v1 site: `.backlog/prds/PRD-marketplace.md` + GitHub #9.

## Blockers

- GitHub slug is `mikemajara/agentlet`. Deploy Button and `-e` URLs use that slug.

## Project Conventions

- Storage adapters: Vercel Blob / R2 / local `./data` via `getStorage()`.
- JSON helpers: `src/lib/json-store.ts` (`readJsonFile` / `writeJsonFile` / `updateJsonFile`).
- Agent tools are domain-specific, not generic SQL.
- Provision smoke: `GET /api/notes` + `/eve/v1/health`.
- Each example is a **self-contained** Next.js app (own `package.json`, `agent/`, provision skills). No workspace packages that Deploy Button / `create-next-app -e` would miss. `files-sdk` stays npm.

## Gotchas

- Concurrent writes: last-write-wins on full JSON rewrite; in-process lock only.
- Deploy-to-Vercel needs GitHub + Vercel. Blob + Gateway are cheap, not $0 forever. Local Companion still needs `vercel link` + `env pull`; production chat is the Deploy Button goal.
- Name collision note (non-blocking): “agentlet” appears in a Substack essay (skills-as-agentlets) and a tiny PyPI stub `agentlet` 0.0.1. Not a well-known product. We are using it anyway.
- Clones used to copy whole GitHub `main` via `create-agent-files`. That package is gone; `create-next-app -e` / Deploy Button clone `examples/notes` only.
