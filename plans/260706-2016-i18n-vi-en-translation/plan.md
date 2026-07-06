---
title: "F005 — Real VI/EN i18n across the whole app"
description: "Self-written dictionary + server locale read, replacing the cookie-only stub; translate Login, Homepage, Prelaunch, Awards."
status: done
priority: P2
effort: 15h
branch: main
tags: [i18n, dictionary, next16, rsc, refactor]
created: 2026-07-06
---

# F005 — Real VI/EN i18n

Replace the cookie-only stub (`NEXT_LOCALE` is written but nothing reads it) with a self-written
TS dictionary + server-side locale read. Translate every already-built screen. No new dependency,
no locale routing, cookie-only persistence stays. Full spec: `spec/i18n-translation/feature.md`;
locked decisions: `clarifications.md`; string source-of-truth: the 4 reports in `reports/`.

## Architecture (one line)
`page.tsx` (Server) → `getLocale()` (await cookies) → `getDictionary(locale)` → pass dict slices as
props down to every child (Server AND Client — strings are serializable). `LanguageSelector` writes
the cookie then `router.refresh()` re-runs the Server tree with the new dict.

## Phases

| # | Phase | Status | Depends | Owns (files, disjoint) |
|---|-------|--------|---------|------------------------|
| 01 | Dictionary module (`lib/i18n/`) | done | — | `lib/i18n/**` |
| 02 | Shared shell + LanguageSelector fix | done | 01 | 6 shared components (see file) |
| 03 | Login screen wiring | done | 01, 02 | `app/login/**` (minus language-selector) |
| 04 | Homepage wiring | done | 01, 02 | `app/page.tsx` + homepage-only home comps |
| 05 | Awards wiring | done | 01, 02 | `app/awards/page.tsx` + `app/components/awards/**` |
| 06 | Prelaunch wiring | done | 01 | `app/prelaunch/**` |
| 07 | Unit tests | done | 01–06 | `*.test.ts(x)` for touched code |
| 08 | E2E tests (Playwright) | done | 01–06 | `e2e/*.spec.ts` |

## Parallelization
- **01 first, alone** (everyone imports its types + dict).
- **06 can start right after 01** (Prelaunch has no shared shell — no header/footer/selector).
- **02 next**, then **03 / 04 / 05 run in parallel** (disjoint file sets; all three only *consume*
  the shell prop-contract that 02 defines, they never edit shell files).
- **07 / 08 last**, after all wiring lands (tests run against final code).

## Key decisions (planner)
- **Countdown labels shared** — `shared.countdown.{days,hours,minutes}` is ONE key set consumed by
  both Homepage (`countdown-timer.tsx`) and Prelaunch (`prelaunch-content.tsx`). Byte-identical
  strings, identical semantics; DRY + the prelaunch report explicitly says "decide once across both
  screens." Supersedes the reports' separate `homepage.hero.countdown.*` / `prelaunch.countdown.*`.
- **Metadata → `generateMetadata()`** (async, reads locale) on all 4 pages; static `metadata` export
  can't read cookies.
- **Venue name `Âu Cơ Art Center` stays hardcoded** (proper noun, same class as brand names the
  clarifications exclude) — not a dict entry. Event date `26/12/2025` IS a dict data-value.
- **`award-detail-data.ts` becomes a factory** `buildAwardDetailEntries(dict)` — translation-as-data
  can't stay a module-level const once it's locale-dependent.

## Risks (top)
- **Build-green window** — 02 changes shell signatures to REQUIRED props; the tree only recompiles
  once 03/04/05 land their pages. Land 02→03/04/05 as one batch. See phase files.
- **`router.refresh()` semantics in Next 16** — verify against installed docs / existing usage.
