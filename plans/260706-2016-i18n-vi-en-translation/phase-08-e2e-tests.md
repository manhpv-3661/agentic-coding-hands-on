# Phase 08 — E2E tests (Playwright)

## Context Links
- Spec: §5 (E2E)
- Existing specs: `e2e/{login,homepage-content,awards-content,prelaunch-countdown,access-control}.spec.ts`
- Depends on: Phases 01–06 (final code)

## Overview
- **Priority:** P2
- **Status:** done
- **Description:** Prove locale selection, persistence (the FR-5 bug-fix regression), first-paint SSR
  rendering (no FOUC), and revert — across all four screens.

## Key Insights
- Locale is server-rendered → assertions target FIRST paint (no wait-for-hydration flip). Set the
  `NEXT_LOCALE` cookie via `context.addCookies()` BEFORE navigating to prove server-side rendering.
- The FR-5 regression: with `NEXT_LOCALE=en` set, a fresh load / reload must show EN — the old bug
  always showed VN after reload. This is the highest-value E2E assertion.
- Extend existing spec files where a screen already has one; add a dedicated `i18n.spec.ts` for the
  cross-screen switch/persist flow.

## Requirements (E2E matrix)
| Scenario | Steps | Assert |
|----------|-------|--------|
| Switch to EN on Login | open `/login` (default VI), open selector, pick English | login copy switches to EN; `NEXT_LOCALE=en` cookie set |
| EN persists across nav | with EN cookie preset, visit `/`, `/awards`, `/prelaunch` | each renders EN on first paint (no VI flash) |
| Revert to VI | from EN, pick Tiếng Việt | all copy reverts to VI; cookie=`vi` |
| Reload persists (FR-5 bug) | set EN cookie, load a page, reload | still EN after reload (regression guard) |
| Default fallback | clear cookie, load `/login` | renders VI |

## Related Code Files
- **Create/Modify (OWNED — e2e only):** `e2e/i18n.spec.ts` (new, cross-screen switch/persist/revert);
  optionally extend `login.spec.ts` / `homepage-content.spec.ts` / `awards-content.spec.ts` /
  `prelaunch-countdown.spec.ts` with an EN-cookie first-paint assertion each
- **Read for context:** existing spec files for auth/setup helpers (login state, cookies)

## Implementation Steps
1. Reuse the existing auth/session setup helper the current specs use (protected routes need a signed-in
   context; `/login` and `/prelaunch` behavior per current gating). Check how `homepage-content.spec.ts`
   authenticates and mirror it.
2. `i18n.spec.ts`:
   - Test A (Login switch): goto `/login`; assert a known VI string; click selector → English; assert
     the EN string; assert cookie via `context.cookies()`.
   - Test B (persist + first-paint): `context.addCookies([{ name:"NEXT_LOCALE", value:"en", ... }])`;
     goto `/`, assert EN heading present immediately; repeat `/awards`, `/prelaunch`.
   - Test C (revert): from EN, select Tiếng Việt; assert VI restored + cookie `vi`.
   - Test D (reload persistence): set EN cookie; goto page; `page.reload()`; assert still EN.
3. Pick assertion strings that are unambiguous per locale (e.g. `Award System` vs `Hệ thống giải thưởng`).
4. `npx playwright test` — all green.

## Todo List
- [x] i18n.spec.ts: Login switch → EN + cookie
- [x] i18n.spec.ts: EN cookie preset → first-paint EN on `/`, `/awards`, `/prelaunch`
- [x] i18n.spec.ts: revert to VI
- [x] i18n.spec.ts: reload persistence (FR-5 regression)
- [x] (optional) per-screen first-paint EN assertion in existing specs

## Success Criteria
- All 4 scenarios pass; FR-5 reload-persistence test green (bug proven fixed).
- First-paint assertions pass WITHOUT waiting for client hydration (proves server-side render).

## Risk Assessment
- **Auth setup for protected routes** (Med/Med): `/`, `/awards` need a session. Countermove: reuse the
  existing specs' auth fixture; don't reinvent.
- **`router.refresh()` timing** (Med/Med): after selecting a locale the refresh is async. Countermove:
  `await expect(...).toHaveText(...)` (auto-retry) rather than a fixed wait.
- **Prelaunch time-gate** (Low/Med): `/prelaunch` visibility depends on `NEXT_PUBLIC_EVENT_START_AT`.
  Countermove: mirror how `prelaunch-countdown.spec.ts` sets/handles the event time.

## Security Considerations
- Tests only manipulate the `NEXT_LOCALE` cookie (non-sensitive). No credentials hardcoded — reuse the
  existing auth fixture/env.

## Next Steps
- Final phase. On green → reviewer sign-off; update `docs/project-changelog.md` + roadmap (F005 done).
