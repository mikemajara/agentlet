# Backlog Memory

## Decisions

- **Product name: agentlet** (locked 2026-08-26). Display: a tiny kit for a cheap, quick agent web app. GitHub rename to `agentlet` when the examples/deploy cut lands (repo is still `agent-files` until then). Not an npm `create-*` product.
- **What it is:** Opinionated stack (Eve companion + JSON files on object storage + domain tools + provision skills). Unopinionated look (shadcn neutral/zinc). Scaffold → dead-simple app you can talk to. Cheap (Hobby Vercel + Blob + Gateway at this volume).
- **Durable state:** JSON (+ markdown) on Vercel Blob / R2 / local `./data`. Domain tools (`list_*` / `get_*` / `add_*` / `update_*`). Seed: `{STORAGE_PREFIX}/notes.json`.
- **How people get an app** (no custom CLI):
  1. **Primary:** Vercel Deploy Button — clone only `examples/notes` into their GitHub repo, provision Blob in the same flow (`stores=[{"type":"blob"}]`). Production Companion via AI Gateway OIDC.
  2. **Terminal:** `npx create-next-app my-app -e https://github.com/<owner>/<repo>/tree/main/examples/notes` (create-next-app, not our CLI).
  3. **Prompt/skill (later):** after clone/deploy, shape the notes app into theirs. GitHub #2. Skill ships *inside* the example.
- **Deprecate** `packages/create-agent-files` / `npx create-agent-files`. Do not invest.
- **Examples:** first cut is `examples/notes` only. No other example types in this backlog. GitHub “Use this template” on the whole repo is not a path (it would copy sibling examples).
- **UI:** shadcn, neutral/zinc, no cream/green branded theme.
- **Self-modification:** not in this cut. Next session. Clone-into-their-GitHub is the foundation.
- **Living docs** describe only the current product. Do not mention DuckDB, Bolsa, CSV catalogs, `run_sql`, or “we used to…”. Historical plan: `.backlog/plans/PLAN-json-file-state.md` (archived). Product umbrella: `.backlog/prds/PRD-agentlet.md`. Execution: `.backlog/plans/PLAN-agentlet.md`.

## Blockers

- GitHub slug is still `mikemajara/agent-files` until rename. Use current URLs in Deploy Button / `-e` until rename; update after.

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
- `create-agent-files` currently clones whole GitHub `main` — that is the bug the examples layout fixes. Do not teach it as the path forward.
