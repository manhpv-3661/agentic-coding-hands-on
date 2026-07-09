---
title: "Supabase dynamic data — all in-scope screens"
description: "Migrate structural/numeric/computed data (awards, event info, Kudos aggregates) to Supabase, mirroring the Kudos isSupabaseConfigured() fallback pattern."
status: pending
priority: P2
effort: 13h
branch: main
tags: [supabase, data-layer, awards, kudos, homepage, seed]
created: 2026-07-09
---

# Supabase Dynamic Data — All In-Scope Screens

Back the SAA 2025 screens with dynamic Supabase reads, extending the existing 3-table
Kudos schema, using the SAME `isSupabaseConfigured()` fallback pattern
(`lib/kudos/kudos-repository.ts`): configured → Postgres; not configured → existing
static mock, so the authless e2e build (port 3100) and `e2e/layout-contract.spec.ts`
stay green with zero e2e changes.

## Scope reality (from R1–R5 research — see phase Key Insights)

Prior i18n work already moved nearly all display copy into `lib/i18n/dictionaries/{en,vi}.ts`.
Because **i18n is a fixed out-of-scope constraint** (dict stays static TS; translations must
NOT move to Supabase), the genuine migration surface is **structural / numeric / computed
data only** — never localized prose. Net effect per screen:

| Screen | Migrates to Supabase? |
|---|---|
| Login (F001) | No — all i18n chrome; auth already dynamic |
| Prelaunch/Countdown (F003) | No — gating timestamp stays env var (hot-path/fail-open, R4); displayed copy is dict |
| Awards (F004) + homepage award grid (F002) | Yes — `award_categories` (structure + numeric amounts); titles/descriptions/units stay in dict, joined by slug |
| Homepage event info (F002) | Yes — `event_settings` (name, venue); displayed date derived from the single env-var timestamp via Intl |
| Homepage hero/narrative copy (F002) | No — localized prose + YAGNI |
| Kudos aggregates (F006/7/8) | Yes — reverses 2026-07-08 "stays mock" decision (see phase-03) |

## Plan-level notes (explicit user decisions — NOT todos)

- **Admin CRUD UI deferred.** Content edits go through the Supabase SQL editor, same as today.
- **i18n → DB deferred.** Dictionaries stay static TS; only locale-agnostic data migrates.
- Schema not yet run in production (per changelog 2026-07-08); this is additive DDL to an
  unrun file — no live migration, no data backfill required.

## Phases

| # | Phase | Status | Depends on |
|---|---|---|---|
| 1 | [Schema additions + seed SQL](phase-01-schema-and-seed.md) | pending | — |
| 2 | [Awards data layer + /awards page](phase-02-awards-data-layer.md) | pending | P1 |
| 3 | [Kudos aggregates → real](phase-03-kudos-aggregates-real.md) | pending | P1 |
| 4 | [Homepage integration (event + award grid)](phase-04-homepage-integration.md) | pending | P1, P2 |
| 5 | [Docs sync](phase-05-docs-sync.md) | pending | P2, P3, P4 |

**Parallelism:** after P1, run **P2 ∥ P3** (disjoint files). P4 after P2 (needs award repo
for the grid; builds its own event repo). P5 last. No two parallel phases share a file
(ownership table in each phase).

## Key risks (full treatment per phase)

- **RLS correctness** on new read-only tables (public-read, no write policy) — phase-01.
- **Prelaunch env-var vs DB** — resolved: keep env var (R4). Do not touch `proxy.ts`.
- **Not breaking the authless e2e build** — every new repo mirrors the fallback branch;
  unconfigured mode returns the existing mock constant verbatim.
- **i18n coupling** — award render now joins DB row (by slug) + dict entry (by slug);
  a slug mismatch drops a card. Mitigation in phase-02.

## Unresolved questions (carried to phases; do not block P1)

1. Kudos sidebar **secret-box** counts have no organic data source — keep static, drop, or
   define a model? (phase-03)
2. Award `season`/`year` versioning — single-edition flat table (YAGNI) assumed. (phase-01)
3. Two award title variants (short "MVP" vs long "MVP (Most Valuable Person)") — which is
   canonical? Both kept in dict for now. (phase-02)
