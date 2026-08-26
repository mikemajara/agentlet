---
slug: agentlet
status: done
created_at: 2026-08-26
---

# PRD: agentlet

Umbrella for turning this repo into **agentlet**: a tiny kit for a cheap, quick agent web app. Locked in conversation 2026-08-26. Execution order: `.backlog/plans/PLAN-agentlet.md`.

## Product

Scaffold the whole thing and get a dead-simple Eve app you can talk to. Cheap. Files on object storage are the database; that is an implementation detail, not the brand.

| Opinionated | Unopinionated |
| --- | --- |
| Eve + JSON-on-Blob/R2/local + domain tools + provision skills | Visual design: shadcn default (neutral/zinc) |

## Name

**agentlet.** GitHub: `mikemajara/agentlet`.

## Create paths (no custom CLI)

1. **Primary:** Vercel Deploy Button cloning `examples/notes` only, with Blob store in the flow. User: Vercel + GitHub accounts. Production Companion: AI Gateway OIDC.
2. **Terminal:** `npx create-next-app -e https://github.com/mikemajara/agentlet/tree/main/examples/notes`.
3. **Later:** prompt/skill in the cloned app to reshape notes into their domain (issue #2). Not this PRD’s first issues.

`create-agent-files` is removed. Do not teach it.

## GitHub issues (this cut)

1. https://github.com/mikemajara/agentlet/issues/4 — docs hygiene  
2. https://github.com/mikemajara/agentlet/issues/5 — shadcn B&W  
3. https://github.com/mikemajara/agentlet/issues/6 — `examples/notes` + Deploy Button + `-e`  
4. https://github.com/mikemajara/agentlet/issues/7 — rename to agentlet  

## Scope of first cut

- Living-doc hygiene (no vestigial experiment story).
- shadcn B&W on the notes UI.
- Repo shape: README index + `examples/notes` (self-contained). Deploy Button + `-e` docs.
- First example: **notes only**.

## Out of scope (do not implement in this cut)

- Self-modification of the running app (next session).
- A second example (recipes, etc.).
- A maintained npm create CLI.
- Machine-specific HTTPS (Caddy / portless).
- Teaching other repos as part of this product.

## Success

Someone with a Vercel account can Deploy, get Blob, open the app, and talk to the notes companion. Someone with a terminal can `create-next-app -e` the same folder and not receive sibling examples.
