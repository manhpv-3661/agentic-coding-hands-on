---
title: "Kudos: Mock → Supabase Postgres Backend Pivot"
description: "Persist Kudos posts/likes/compose to Supabase Postgres (sole datastore) with RLS, keeping mock fallback for authless e2e."
status: pending
priority: P2
effort: 22h
branch: main
tags: [kudos, supabase, backend, rls, migration, pivot]
created: 2026-07-08
---

# Kudos Supabase Backend Pivot

Pivot the Kudos cluster (screens 13/14/15) from the frontend-only mock
(`lib/kudos/kudos-data.ts`) to a **real Supabase Postgres backend** — the
sole datastore (no separate Postgres/Redis; whole app deploys to Vercel).
Supabase Auth (Google OAuth) is already live; Postgres currently has **zero
tables**. This supersedes the prior "no backend" decisions recorded across
the kudos `clarifications.md` files — see this plan's `clarifications.md`.

## Keystone design decision (migration safety)

The data layer **branches on `isSupabaseConfigured()`**:
- **Reads** (`lib/kudos/kudos-repository.ts`): configured → query Postgres,
  map rows to the existing `KudosPost` view-model; not configured → return
  the static mock (`KUDOS_POSTS` etc.) exactly as today.
- **Mutations** (`app/kudos/actions.ts` Server Actions): configured →
  insert/delete rows; not configured → no-op return, client keeps its
  optimistic session state (identical to today's behavior).

This preserves the **authless e2e build** (port 3100, no Supabase env →
mock renders) so `e2e/layout-contract.spec.ts` and the spotlight-name-cloud
test stay green, and keeps the `KudosPost` contract stable so selectors,
cards, board, carousel, feed need **no shape changes**. Adaptation happens
only at the repository boundary.

## Scope split (80/20)

- **Goes real:** posts, likes, compose, + a `profiles` table for real
  sender identity. These are the persisted / per-user / interactive parts.
- **Stays mock (decorative, no per-user meaning):** sidebar stats
  (`KUDOS_STATS`, incl. fake "Secret Box"), Spotlight name-cloud +
  "388 KUDOS" counter, "10 Sunner nhận quà" list. Recommended deferral —
  flagged as open questions, not assumed.

## Phases

| # | Phase | Status | Effort | Depends on |
|---|-------|--------|--------|-----------|
| 01 | [Schema + RLS + seed SQL](phase-01-schema-rls-migration.md) | pending | 4h | — |
| 02 | [Data-access repository (reads)](phase-02-data-access-repository.md) | pending | 3h | 01 |
| 03 | [Server Actions (mutations)](phase-03-server-actions-mutations.md) | pending | 3h | 01, 02 |
| 04 | [Wire compose → backend](phase-04-wire-compose-flow.md) | pending | 3h | 02, 03 |
| 05 | [Wire like-toggle → backend](phase-05-wire-like-toggle.md) | pending | 3h | 04 |
| 06 | [Profiles identity + decorative data](phase-06-profiles-identity-decorative-data.md) | pending | 2h | 02 |
| 07 | [Tests migration (unit + e2e)](phase-07-tests-migration.md) | pending | 4h | 04, 05, 06 |
| 08 | [Docs update](phase-08-docs-update.md) | pending | 1h | 07 |

Critical path: 01 → 02 → 03 → 04 → 05 → 07 → 08. Phase 06 runs parallel to
03/04/05 (different files). See each phase's Risk + Rollback sections.

## Key dependencies / sequencing notes

- **File-ownership overlap with the parallel layout-system plan**
  (`plans/260707-2337-site-layout-system-audit-fixes/`): both may touch
  `app/components/kudos/kudos-page-client.tsx` and `app/kudos/page.tsx`.
  **Do not start Phase 04/05 until that plan's kudos work has landed**, or
  coordinate a merge point — do not resolve here.
- Phases 04 and 05 both edit `kudos-page-client.tsx` + `page.tsx` → must be
  **sequential** (04 then 05), never parallel.
- `.env.local` already has real Supabase URL/anon key; Phase 01 SQL is run
  once via the Supabase Dashboard SQL editor (no CLI migration workflow).

## Open questions (confirm before Phase 01)

See `clarifications.md` → "Open — needs confirmation". Blocking items:
recipient model (free-text vs real-user FK), profile department/stars
seeding, kudos immutability, and whether decorative data stays mock.
