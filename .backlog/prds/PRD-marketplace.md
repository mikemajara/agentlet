---
slug: marketplace
title: Agentlet marketplace (catalog as an agentlet)
status: ready
issue: https://github.com/mikemajara/agentlet/issues/9
created_at: 2026-08-27T21:53:00Z
---

> **HISTORICAL (catalog-first v1).** [#9](https://github.com/mikemajara/agentlet/issues/9) shipped the catalog app; it is **not** the current user first-run. Current v1: private Deploy of `examples/notes` → talk → Allow ([#16](https://github.com/mikemajara/agentlet/issues/16)) → companion changes app ([#14](https://github.com/mikemajara/agentlet/issues/14)). Living lock: [`.backlog/memory.md`](../memory.md). Catalog go-live is later ([#10](https://github.com/mikemajara/agentlet/issues/10)).

# Agentlet marketplace

Product umbrella for the **v1 public site**: a free catalog of deployable agentlets, where the catalog itself is an agentlet.

Executable work: GitHub #9. Do not paste this file into an issue body.

Related (not this PRD): hotel and clinician examples in `.backlog/inbox.md`; self-modification inbox item; GitHub #8 (NYC taxi — later listing).

## Problem

Use cases keep showing up. Each is the same base with small variations, but there is no place to land, compare, filter, and deploy. README-as-index does not scale. A package monorepo would fight Deploy Button / `create-next-app -e`.

## Goal

One website: browse agentlets, filter by capability tags (`memory`, `self-modifying`, later others), clone or Deploy Button into the user’s GitHub + Vercel. The site is an agentlet: companion top-right, catalog list front-center.

## Requirements

- Same-repo catalog, not a shared-package monorepo. `examples/*` stay self-contained.
- Distribution stays Deploy Button + `create-next-app -e` on a single example folder.
- Marketplace is an agentlet (`list_*` / `get_*` over the catalog).
- Capability tags are filters, not a second architecture.
- v1 catalog lives in git. Per-user tools are not marketplace storage.
- Adding an example is a folder + a catalog row.

## Out of Scope

- Multi-tenant connect-your-tools platform on the marketplace.
- pnpm/turborepo shared `src` across examples.
- Shipping many examples before the catalog exists.
- Paid listing, accounts, public submit.
- Implementing self-modification or memory examples here (tag vocabulary only).

## Linked Issues

- https://github.com/mikemajara/agentlet/issues/9 — marketplace catalog as an agentlet (v1 site)
- https://github.com/mikemajara/agentlet/issues/8 — NYC taxi example (later listing, not v1)

## Open Questions

Resolved on #9:

1. Layout: `apps/web` + `examples/*`.
2. Catalog: `apps/web/catalog.json`.
