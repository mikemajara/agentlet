# agentlet

Tiny kit for a **cheap, quick agent web app** — Eve companion + JSON (+ markdown) on Blob / R2 / local.

**Direction (locked):** this product is **agentlet**. Do not re-litigate. Read `.backlog/memory.md` and `.backlog/prds/PRD-agentlet.md` before changing docs, scaffold, or UI. Execution: `.backlog/plans/PLAN-agentlet.md`.

The runnable app lives in [`examples/notes`](./examples/notes). Root README is the product index (Deploy Button + `create-next-app -e`). Do not teach GitHub “Use this template” on this whole repository.

## Architecture

- **Storage:** `files-sdk` adapters — Vercel Blob (default), Cloudflare R2, or local `./data`
- **State:** JSON files under `STORAGE_PREFIX` (seed demo: `notes.json`) via `src/lib/json-store.ts` + domain modules
- **Agent:** `agent/` Eve tools — `list_notes`, `get_note`, `add_note`, `update_note`

Provision skills ship **inside the example**: `examples/notes/.agents/skills/provision-vercel`, `provision-storage`, and post-clone `reshape-domain`.
