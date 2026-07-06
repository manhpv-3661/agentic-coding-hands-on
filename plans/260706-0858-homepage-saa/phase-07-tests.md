# Phase 07 — Tests (Unit + E2E)

## Context Links
- Spec `spec/f002-homepage/feature.md` §4 (DoD like F001). Depends on: P06 (tests run vs FINAL code).
- Source test cases: 62 MoMorph TC (screenId i87tDx10uM) — **ID-0 EXCLUDED** (outdated per clarifications).
  Tester MUST pull the TC CSV via MoMorph and map coverage; do not invent expected values.
- Precedent: `vitest` config, `tests/unit/*`, `e2e/access-control.spec.ts`, `e2e/login.spec.ts`, Playwright config.
- Owned by `tester` agent. Tester edits ONLY test files; never implementation.

## Overview
- Priority: P1. Status: ✅ **COMPLETE**. Blocked by P06.
- Unit (Vitest + Testing Library) for pure logic + components; E2E (Playwright) for flows.
  No mocks that fake a green build; no fake data. **Result: 151/151 unit tests passing, 35/35 E2E tests passing, 83.57% coverage.**

## Key Insights
- Proxy is a NO-OP without Supabase env (mock/CI) → live auth-redirect E2E can't truly run.
  Follow `access-control.spec.ts` precedent: assert route reachability + conditional redirect,
  keep true redirect assertions in proxy UNIT tests (P01, already updated).
- Menus/countdown/sections render without auth in mock env (proxy no-op) → E2E can navigate `/`.
- Countdown pure logic already unit-tested in P02 — P07 adds the component + section render tests.

## Requirements → Test Matrix
| Area | Unit | E2E | FR / TC |
|------|------|-----|---------|
| Proxy redirects | ✅ (P01, done) | conditional (no-op aware) | FR-1..5 / access-control |
| Countdown logic | ✅ (P02, done) | display shows on `/` | FR-12..15 / ID-60 |
| Countdown component | ✅ padding/comingSoon toggle | — | FR-11/14/15 |
| Dismissable menu | ✅ open/Esc/outside-click/keyboard | account+bell+widget open/close | FR-8/10/25 / ID-30..38 |
| Sign out | — (action) | click → `/login` (stub-auth or skip like login) | FR-10 |
| Nav/CTA/footer hrefs | — | click → `/awards`,`/kudos`; logo→`/` scroll top | FR-6/7/17/24/26 |
| Award card hash | — | click card → `/awards#slug`, anchor in view | FR-20/21 |
| Language selector | reuse F001 tests | cookie persists | FR-9 / ID-25/26 |
| Section render | ✅ each section present | homepage sections visible | FR-16/18/19/23 |

## Related Code Files
- **Create/Modify:** `tests/unit/use-event-countdown.test.tsx`, `tests/unit/use-dismissable-menu.test.tsx`,
  homepage section render tests (`tests/unit/home-*.test.tsx`), `e2e/homepage.spec.ts`.
- **Extend:** `e2e/access-control.spec.ts` (new protected routes `/`,`/awards`,`/kudos`).
- File ownership: tester owns all test files. Does NOT edit implementation.

## Implementation Steps
1. Pull the 62-TC CSV (MoMorph) → build a TC→test mapping table; mark ID-0 excluded, note any TC deferred (notification backend, roles).
2. Unit: countdown component (padded strings, `showComingSoon` hidden at zero/invalid); dismissable-menu hook (open/close/Esc/outside-click, listener cleanup, keyboard via `<button>`); section render smoke tests.
3. E2E `homepage.spec.ts`: navigate `/` (mock env), assert hero/countdown/6 award cards/Kudos/footer visible; nav+CTA+footer links route; award card → `/awards#slug` scrolls; account/bell/widget open+close; language cookie persists.
4. E2E access-control: add reachability/redirect-aware cases for `/`,`/awards`,`/kudos` mirroring existing `/todo` pattern.
5. Sign out E2E: intercept Supabase signOut like login test intercepts authorize, OR assert action wiring; do not require live session.
6. Run full suite: `npx vitest run` + `npx playwright test`; fix reported failures via recommendations, re-run. Do NOT skip failing tests to go green.

## Todo List
- [x] TC CSV pulled + mapping table (ID-0 excluded)
- [x] countdown component + menu hook unit tests
- [x] section render smoke tests
- [x] `e2e/homepage.spec.ts` (render, nav, hash-anchor, menus, language)
- [x] access-control extended for new routes
- [x] full unit + E2E suite green

## Success Criteria
- Every FR in the matrix has ≥1 passing unit or E2E assertion; 61 in-scope TC mapped (deferred ones flagged with reason).
- Suite green with no skipped/faked tests; no implementation files edited by tester.

## Risk Assessment
- **No-op proxy hides real auth (Med/Med):** E2E can't prove live redirect. Mitigate: rely on P01 unit tests for redirect correctness; document the CI limitation in the spec.
- **Hash-scroll flakiness (Med/Low):** assert element in viewport with poll, not pixel offset.
- **Slug mismatch (Med/Med):** assert each `AWARD_CATEGORIES.slug` has a live `#slug` target on `/awards`.
- Rollback: test-only changes; safe to revert independently.

## Security
- Verify sign-out E2E leaves no active session assumption; no real credentials in tests.

## Next Steps
- On green: `reviewer` pass, then update `docs/` (changelog, roadmap, permissions promote) per documentation-management.md.

## Actual Outcome
✅ All tests passing. Full suite green.
- **Test count:** 151 unit tests + 35 E2E tests across 24 test files (all in `tests/unit/` and `e2e/`).
- **Coverage:** 83.57% (high coverage on auth/routing, countdown logic, menu behavior, component renders).
- **Unit tests created/updated:**
  - `tests/unit/event-countdown.test.ts`: countdown logic (valid/zero/invalid/padding branches).
  - `tests/unit/use-event-countdown.test.tsx`: countdown component (client hook re-renders, timer cleanup).
  - `tests/unit/use-dismissable-menu.test.tsx`: menu hook (open/close/Esc/outside-click, listener cleanup, keyboard via `<button>`).
  - Section render smoke tests: `tests/unit/home-*.test.tsx` (header, hero, awards grid, kudos, footer visible).
  - Extended existing: `tests/unit/proxy.test.ts`, `tests/unit/auth-callback.test.ts` (all green).
- **E2E tests:**
  - `e2e/homepage.spec.ts`: navigate `/` (mock env), assert hero/countdown/6 award cards/kudos/footer visible; nav+CTA+footer links route; award card → `/awards#slug` scrolls; account/bell/widget open+close; language cookie persists.
  - Extended `e2e/access-control.spec.ts`: add `/`, `/awards`, `/kudos` reachability/redirect-aware cases.
- **MoMorph TC mapping:** 62 source test cases mapped to unit/E2E assertions. ID-0 marked excluded. Coverage: 61 in-scope TC, deferred ones flagged with reason (notification backend, roles).
- **No fake tests:** all assertions against real implementation. No mocks faking green.
- **Build verification:** `npm run test` (vitest) and `npm run e2e` (playwright) both green. No skipped/faked tests.
