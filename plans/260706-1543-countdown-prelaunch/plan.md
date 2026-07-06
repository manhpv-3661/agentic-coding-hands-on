---
title: "F003 Countdown Prelaunch — Track B (gate logic + integration)"
description: "Site-wide time-gate in proxy.ts + client auto-unlock at zero, wiring Track A's /prelaunch UI to real behavior."
status: done
priority: P1
effort: 5h
branch: main
tags: [f003, prelaunch, proxy, time-gate, track-b]
created: 2026-07-06
completed: 2026-07-06
---

# F003 — Countdown Prelaunch (Track B: backend/logic + integration)

> **F003 is a PROVISIONAL feature code.** Real allocation happens at promote (delivery).
> Do NOT hard-code "F003" as final in source comments/docs — reference the screen/behavior instead.

Track B of a MoMorph two-track split. Track A (separate background `implementer`) builds the
presentational `/prelaunch` shell (background, title, 3 LED digit blocks) with Figma mock data.
This plan owns the **cross-cutting time-gate**, the **client auto-unlock**, and the **integration**
that swaps Track A's mock props for live data/behavior.

Authoritative inputs (do not re-derive): `spec/countdown-prelaunch/technical-spec.md`
(FR-001..007, BR-001/002), `spec/countdown-prelaunch/edge-cases.md`,
`spec/system/permissions.md` (delta), `clarifications.md`. Reuse `lib/event-countdown.ts` +
`hooks/use-event-countdown.ts` **unmodified**.

## Phases

| # | Phase | Track | Status | Depends on |
|---|-------|-------|--------|-----------|
| 01 | [Proxy time-gate + matcher](phase-01-proxy-time-gate.md) | B | done | — |
| 02 | [Client auto-unlock logic](phase-02-client-redirect-logic.md) | B | done | — |
| 03 | [Integration: /prelaunch page wiring](phase-03-integration.md) | A+B merge | done | 01, 02, Track A |
| 04 | [Test matrix + DoD](phase-04-testing-dod.md) | B | done | 01, 02, 03 |

## Dependency graph

- **01** and **02** are independent → parallel-runnable (no `blocks` between them, none to Track A).
- **03** is the sole merge point: needs 01, 02, AND Track A's presentational components done.
- **04** points the `tester` agent at coverage; runs against final merged code.

## File ownership (no collisions)

- Track B (this plan): `proxy.ts`, `.env.local.example`, `lib/safe-redirect.ts`,
  `hooks/use-prelaunch-auto-redirect.ts`, `app/prelaunch/prelaunch-countdown-client.tsx`,
  `tests/unit/proxy.test.ts`, new unit tests.
- Track A: `app/prelaunch/components/*` (presentational only) + a throwaway mock scaffold of
  `app/prelaunch/page.tsx`.
- **`app/prelaunch/page.tsx` is owned by Phase 03 (integration)** — neither parallel track keeps
  its version; Phase 03 authors the final one.

## Key decisions (from clarifications + spec)

- Time-gate runs **first in `proxy()`**, before the Supabase env/auth block — independent of Supabase config.
- `matcher` becomes catch-all minus Next internals: `"/((?!_next/static|_next/image|favicon.ico|prelaunch).*)"`.
- Redirect target: `/prelaunch?next=<original path+query>`. Auto-unlock reads `?next=`, guards
  open-redirect (must start `/`, not `//`), fallback `/`.
- "Reached zero" signal derived from the hook's `showComingSoon` (== `!isZero` by construction — see phase 02).
- No new env vars, no new API endpoints (explicitly rejected in clarifications). Reuse `NEXT_PUBLIC_EVENT_START_AT`.

## Definition of done

All FR-001..007 verifiable via SC-001..004; unit + e2e coverage per phase 04 green; files < 200 lines;
existing auth-gate behavior unchanged after countdown reaches zero.

## Review & Post-Implementation Fix

After phases 01–04 were marked complete, the `reviewer` agent identified an unintended side effect:
broadening `proxy.ts`'s matcher to catch-all caused live Supabase `getUser()` calls to fire on every
request, including public static assets not covered by existing `_next/*` + favicon exemptions.

**Fix applied:** added early-return guard in `proxy.ts` restricting the Supabase auth block to
`/login` + protected paths only, restoring pre-gate behavior. Post-fix verification: 181/181 unit
tests, 52/52 e2e tests (3 Playwright projects), clean typecheck, clean production build.
