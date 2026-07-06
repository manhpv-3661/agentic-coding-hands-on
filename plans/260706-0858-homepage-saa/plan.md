---
title: "F002 Homepage SAA — Track B (logic + integration)"
description: "Auth/routing, countdown logic, placeholder routes, behavior wiring, integration + tests for the SAA 2025 homepage."
status: complete
priority: P2
effort: 9h
branch: main
tags: [homepage, auth, countdown, nextjs16, supabase]
created: 2026-07-06
completed: 2026-07-06
---

# F002 Homepage SAA — Implementation Plan (Track B)

Backend/behavior logic + integration for the SAA 2025 homepage (`/`). Track A (pixel-perfect
UI from Figma) runs in a PARALLEL background agent and is NOT a blocking dependency here — it is
represented as one minimal phase (P05) and consumed at the integration phase (P06).

**Authoritative inputs:** `spec/f002-homepage/feature.md` (FR-1..FR-26), `clarifications.md`
(5 decisions), `spec/system/permissions.md` (route matrix).

**Next.js 16 note:** breaking changes vs training data. Before editing routing/proxy, READ the
proxy/middleware guide under `node_modules/next/dist/docs/`. `cookies()` is async; `middleware`
is now root `proxy.ts` with `nodejs` runtime.

## Phases

| # | Phase | Status | Depends on | Effort |
|---|-------|--------|-----------|--------|
| 01 | [Auth & routing](phase-01-auth-routing.md) — protect `/`,`/awards`,`/kudos`; land → `/` | ✅ complete | — | 1.5h |
| 02 | [Countdown logic](phase-02-countdown-logic.md) — env parse util + hook, zero/invalid states | ✅ complete | — | 1.5h |
| 03 | [Placeholder routes](phase-03-placeholder-routes.md) — `/awards`,`/kudos` + 6 slug anchors | ✅ complete | 01 | 1h |
| 04 | [Behavior wiring](phase-04-behavior-wiring.md) — sign-out action, dismissable-menu hook | ✅ complete | — | 1h |
| 05 | [Track A UI](phase-05-track-a-ui.md) — presentational homepage (PARALLEL agent) | ✅ complete | — | — |
| 06 | [Integration](phase-06-integration.md) — wire logic into Track A components | ✅ complete | 01,02,03,04 | 2h |
| 07 | [Tests](phase-07-tests.md) — unit (Vitest) + E2E (Playwright), map 62 TC (ID-0 excl.) | ✅ complete | 06 | 2h |

## Dependency graph

```
P01 ─┐
P02 ─┼──────────────► P06 ──► P07
P03(←P01) ─┤
P04 ─┘
P05 (Track A, parallel) ····soft····► P06   (no blocks/blockedBy — MoMorph rule)
```

## Parallelization

- Track B P01, P02, P04 start immediately in parallel (disjoint files). P03 waits on P01's guard helper.
- Track A (P05) runs concurrently the whole time; integration (P06) consumes its output incrementally.
- No two phases own the same file — see each phase's "Related Code Files".

## Key decisions (from clarifications.md)

- `/` protected (commission wins over TC ID-0). Post-login destination `/` (was `/todo`).
- `/awards`,`/kudos` = protected placeholders with hash anchors; real screens later.
- Language selector = cookie `NEXT_LOCALE` + label only (no content translation) — F001 precedent.
- Bell/account/widget = stubs; Sign out = real Supabase. Admin Dashboard hidden (no roles yet).
- Event target env = `NEXT_PUBLIC_EVENT_START_AT` (ISO-8601). Missing/invalid → `00 00 00`, hide
  "Coming soon", `console.warn`, no crash.
