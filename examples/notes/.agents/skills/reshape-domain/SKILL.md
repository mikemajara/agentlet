---
name: reshape-domain
description: >-
  Turn this cloned notes agentlet into the user's domain (new JSON file,
  typed module, Eve list/get/add/update tools, API route, seed, companion
  copy, UI fields). Use after Deploy or create-next-app -e when the user
  wants recipes, tasks, inventory, or any noun instead of notes. Do not use
  for Vercel/Gateway (provision-vercel) or Blob/R2/local credentials
  (provision-storage). Do not push to GitHub from the running companion.
---

# Reshape domain (agentlet)

This checkout is a **notes** demo. After clone/deploy, replace notes with the
user's entity. Same stack: JSON on Blob/R2/local, Eve tools, shadcn UI.

**Not this skill:** linking Vercel, AI Gateway, or storage backends. Run
`provision-vercel` / `provision-storage` separately if Companion or cloud
storage is not ready.

**Not this skill:** the deployed app committing to GitHub. Local/clone coding
agent only.

## Goal / Definition of Done

From the **app root** (this Next.js project):

1. Ask the user for **singular** + **plural** nouns and **2–5 real fields**
   (not a blind `title`/`body` rename). Example: habit = `name`, `cadence`,
   `note`.
2. Durable state is `{STORAGE_PREFIX}/<plural>.json` with `schemaVersion` and
   an array of records (`id`, `created_at`, `updated_at`, plus domain fields).
3. Eve tools are `list_<plural>`, `get_<singular>`, `add_<singular>`,
   `update_<singular>` — domain descriptions, not “notes”.
4. HTTP: `GET`/`POST` `/api/<plural>`. **Delete** `/api/notes`.
5. UI form/list fields match the domain. Companion `agent/instructions.md`
   matches tools + file shape.
6. Smoke (dev server running):

```bash
curl -sS "http://127.0.0.1:<port>/api/<plural>"
curl -sS "http://127.0.0.1:<port>/eve/v1/health"
```

Expect a JSON array (or `{ <plural>: [...], backend }`) and Eve health ok.
A notes-shaped payload (`title`/`body`/`tags` only, `notes.json`) **fails**.

7. Update smoke paths in `.agents/skills/provision-vercel/SKILL.md` if they
   still say `/api/notes`.

## Prerequisites

- Work in the **cloned app root**, not the kit repo root if this folder is
  `examples/notes` inside `agentlet`.
- Do not add DuckDB, SQL catalogs, `run_sql`, or a custom create CLI.

## Steps

### 1. Lock the domain with the user

Collect: singular, plural, fields, one-line companion identity. If they only
say “make it mine”, ask. Do not invent a second product.

### 2. Replace the data module (do not string-rename `notes.ts`)

Keep `src/lib/json-store.ts` and `src/lib/storage/*` adapters.

Change:

| File | Action |
| --- | --- |
| `src/lib/schema.ts` | New types, `<plural>Key()`, `EMPTY_*`, `SEED_*` for the new noun |
| `src/lib/storage/index.ts` | `ensureSeeded()` must read/write the **new** key + seed (it currently imports `notesKey` / `SEED_NOTES`) |
| `src/lib/<plural>.ts` | New `list`/`get`/`add`/`update` module; **delete** `src/lib/notes.ts` |
| `templates/seed/notes.json` | Replace with `<plural>.json` seed matching `SEED_*` |

`id` prefix: `<singular>_` + short uuid. Validate required fields in add/update.

### 3. Replace Eve tools

Under `agent/tools/`:

- Add `list_<plural>.ts`, `get_<singular>.ts`, `add_<singular>.ts`,
  `update_<singular>.ts` (`defineTool` + zod, call the new module).
- **Delete** `list_notes.ts`, `get_note.ts`, `add_note.ts`, `update_note.ts`.
- Writes: confirm with the user before calling, same as notes.

Rewrite `agent/instructions.md` for the new tools and JSON shape. Never invent
rows; always use tools.

### 4. Replace the HTTP + UI surface

- Add `src/app/api/<plural>/route.ts` (`GET` list, `POST` add). **Delete**
  `src/app/api/notes/`.
- Point `src/app/page.tsx` + `WorkspaceApp` at `/api/<plural>` and domain
  fields. Keep shadcn (`Card`, `Field`, `Button`, `Sheet`).
- Layout title/description and companion chrome: new noun, not “notes”.

### 5. Grep and smoke

```bash
rg -n "notes\.json|list_notes|/api/notes|type Note" --glob '!node_modules/**' --glob '!.next/**'
```

Only hits should be historical comments you intend to keep (prefer none).

Restart `npm run dev`. Run the DoD curls. Fix until the list payload is the
new entity.

### 6. Report

Return: nouns + fields, files added/removed, smoke URLs and a short JSON
excerpt (no secrets).

## Notes

- Existing `{STORAGE_PREFIX}/notes.json` in Blob/local is **not** migrated.
  New key = empty/seed file. Say so if the user had notes they care about.
- `json-store` last-write-wins still applies.
