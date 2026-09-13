---
slug: agentlet
status: done
prd: .backlog/prds/PRD-agentlet.md
created_at: 2026-08-26
---

> **HISTORICAL.** Execution plan for the first kit cut (issues #4–#7). Current v1 lock: [`.backlog/memory.md`](../memory.md) + [#15](https://github.com/mikemajara/agentlet/issues/15) / [#16](https://github.com/mikemajara/agentlet/issues/16) / [#14](https://github.com/mikemajara/agentlet/issues/14) / [#17](https://github.com/mikemajara/agentlet/issues/17).

# Plan: agentlet cut

Sequence for the locked PRD. Do not re-litigate name, CLI, examples, or style.

## Issues

| Step | Issue |
| --- | --- |
| 1 Hygiene | https://github.com/mikemajara/agentlet/issues/4 |
| 2 shadcn B&W | https://github.com/mikemajara/agentlet/issues/5 |
| 3 examples + Deploy / `-e` | https://github.com/mikemajara/agentlet/issues/6 |
| 4 Rename to agentlet | https://github.com/mikemajara/agentlet/issues/7 |

Later: #2 (shape skill). Close #1 as superseded (#4 owns that).

## Order

1. **Hygiene** (#4) — Living docs + memory already describe agentlet. Strip README / AGENTS / inbox / seed copy of Bolsa, DuckDB, “we used to…”. Banner-archive `PLAN-json-file-state.md` if not already. Close or rewrite GitHub #1 (stale DuckDB recipes + “prompts not apps”). Leave #2 open as *later* “shape the app” skill.
2. **shadcn B&W** — Init shadcn (neutral/zinc). Rebuild notes UI with Card/Button/Input/Sheet (companion). No cream/green, no radial washes. Verify in browser.
3. **`examples/notes` + create paths** — Move the Next+Eve app into `examples/notes` (self-contained, including `.agents/skills` provision). Root README: product pitch + Deploy Button (`repository-url` tree to `examples/notes`, `stores` Blob) + `create-next-app -e` one-liner. Stop documenting `create-agent-files`. Optional: leave the package folder but mark deprecated, or remove in the same PR if cheap.
4. **Rename** — GitHub `mikemajara/agentlet`, update Deploy/`-e` URLs, package names, AGENTS/README. After 3 so URLs change once.

## Verification

- Fresh reader of README never sees DuckDB/Bolsa/custom CLI as the path.
- Notes UI is shadcn semantic tokens only.
- Deploy Button / `-e` produce a repo that is the notes app only.
- `GET /api/notes` + `/eve/v1/health` still hold in the example.
- Local `STORAGE_BACKEND=local` still works without cloud creds.

## Explicitly later

- Self-modification.
- Issue #2 e2e “shape it” skill implementation.
- Further examples (search personal notes; none in this backlog).
