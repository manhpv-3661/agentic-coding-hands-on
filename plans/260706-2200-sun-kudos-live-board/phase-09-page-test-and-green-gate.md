---
feature: F006
phase: 09
title: Page test + full green gate
status: done
---

# Phase 09 — Page test + full green gate

## Context Links
- Spec: FR-1/2 (guard), NFR-3, section 4 (Definition of Done: Vitest green, `tsc --noEmit`
  clean, dual-locale unit tests).
- Depends: **08** (final page + board composition).
- Pattern refs: `tests/unit/kudos-page.test.tsx` (existing stub test — being rewritten),
  `tests/unit/awards-page.test.tsx` (page test with `requireUser` mock + fonts mock),
  `app/components/home/sun-kudos-section.test.tsx` (dual-locale spot-check style).

## Overview
- **Priority:** P1 · **Status:** pending
- Rewrite the existing `tests/unit/kudos-page.test.tsx` (currently asserts the stub heading —
  will break after Phase 08) and run the full green gate (typecheck + build + all tests).
- Component-level tests are colocated within Phases 01/03/04/05/06/07 — this phase is the
  page-level test + the whole-suite gate, NOT a re-do of component tests.

## Key Insights
- The old test asserts `heading name "Sun* Kudos"` and the stub — those assertions break once
  `page.tsx` renders the full board. MUST rewrite in this delivery, not leave red.
- Page test must mock `@/lib/auth/require-user` (existing pattern) AND `next/font/google`
  (fonts are imported via `app/login/fonts.ts`, same as awards/home page tests).
- Keep the `requireUser` guard assertion (FR-1/2). Assert the major sections render
  (banner title, "HIGHLIGHT KUDOS", "SPOTLIGHT BOARD", "ALL KUDOS", stats/top-10 heading).
- Client subtrees (board, carousel, spotlight) render under jsdom via RTL — no special setup
  beyond the font mock; interactions already covered by colocated component tests.

## Requirements
- Rewrite `tests/unit/kudos-page.test.tsx`: mock `requireUser` + `next/font/google`; assert
  guard called once; assert full page renders key section markers (not the old stub).
- Optional dual-locale spot-check at page level (render with VI vs EN dict) — or rely on the
  colocated dual-locale component tests (which already exist per Phases). Keep the page test
  lean; dual-locale coverage lives in component tests.
- Full green gate: `npm run test` all green; `npx tsc --noEmit` clean; `next build` passes.

## Related Code Files
- **Rewrite:** `tests/unit/kudos-page.test.tsx`
- **Read for context:** `tests/unit/awards-page.test.tsx`, `app/components/home/sun-kudos-section.test.tsx`, `app/kudos/page.tsx`
- **Do NOT edit:** any `app/components/kudos/*` implementation (test owns test files only)

## Implementation Steps
1. Rewrite `tests/unit/kudos-page.test.tsx`:
   - `vi.mock("@/lib/auth/require-user", ...)` (keep) + `vi.mock("next/font/google", ...)`
     (Montserrat/Montserrat_Alternates → `{ variable, className }`).
   - Test: `requireUser` called once (guard, FR-1/2).
   - Test: page renders banner title + "HIGHLIGHT KUDOS" + "SPOTLIGHT BOARD" + "ALL KUDOS" +
     recent-recipients heading (section presence). Remove old stub-heading assertion.
2. Run `npm run test` — fix any regression (parity test, colocated tests) surfaced.
3. Run `npx tsc --noEmit` and `next build` — resolve any RSC-boundary / type error.

## Todo List
- [x] Rewrite `tests/unit/kudos-page.test.tsx` (mock requireUser + fonts; guard + sections)
- [x] `npm run test` fully green (incl. `parity.test.ts` + all colocated kudos tests)
- [x] `npx tsc --noEmit` clean
- [x] `next build` passes (no RSC client-boundary error)

## Success Criteria
- Page test asserts the guard + the full-board render (not the stub); whole Vitest suite green;
  `tsc --noEmit` clean; `next build` succeeds.

## Risk Assessment
- **Font import crashes page test (High/Med):** mock `next/font/google` (documented). **Countermove:**
  copy the mock shape from `awards-page.test.tsx`.
- **Server component under jsdom (Med/Low):** page is async — `render(await KudosPage())` like the
  awards/existing kudos test; requireUser mocked to resolve.
- **Leftover stub assertion left red (High/High):** the whole point of this phase — rewrite, don't skip.

## Security Considerations
- Test-only; asserts the `requireUser()` guard is intact. None beyond existing gate.

## Next Steps
- Feature ready for `reviewer`; after merge, promote the spec draft to
  `docs/features/f006-sun-kudos-live-board/feature.md` (single-file convention) and mark the
  out-of-scope MoMorph test cases (like-toggle, compose dialog, real reward, detail/profile
  pages) as deferred with reasons.
