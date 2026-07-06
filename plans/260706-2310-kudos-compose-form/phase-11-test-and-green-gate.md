---
feature: F007
phase: 11
title: Test + green gate
status: done
---

# Phase 11 — Test + green gate

## Context Links
- Spec: §4 Definition of Done (all FR-1..21 covered by self-written tests; no MoMorph test cases exist).
- Depends: Phase 10 (all wiring complete).
- Existing gate commands: `researcher-02-*.md` §6 (`npm run build` = type-check, `eslint`, `vitest`).

## Overview
- **Priority:** P1 (release gate) · **Status:** pending
- One page-level integration test + the full green gate across vitest / tsc / eslint.

## Key Insights
- No dedicated `typecheck` script — `npx tsc --noEmit` is the fast type gate; `npm run build` is
  the authoritative one.
- Component tests already live beside each component (Phases 03-09); this phase adds the end-to-end
  flow test and runs everything together.

## Requirements
- **§4 DoD:** `npx vitest run` 100% green; `npx tsc --noEmit` 0 errors; `npx eslint` clean on all
  new/modified files; i18n parity test green.
- Integration test proves the full compose→submit→prepend→toast flow (FR-1, FR-4/9/13/19, FR-21).

## Architecture
`tests/unit/kudos-compose.test.tsx` renders `KudosPageClient` (or `page`-equivalent composition) with
mock props and drives the flow with `@testing-library/user-event`:
1. Pill click → `getByRole("dialog")` visible.
2. Submit with empty fields → inline errors shown, feed length unchanged.
3. Fill recipient + title + content + ≥1 hashtag → submit → dialog closes, new card is FIRST in the
   feed (assert order), success toast (`role="status"`) shown.
4. Anonymous path: check + nickname → submitted card shows the nickname as sender.
5. Escape/backdrop closes the dialog and discards the draft.

## Related Code Files
- **Create:** `tests/unit/kudos-compose.test.tsx`
- **Read for context:** `tests/unit/kudos-page.test.tsx` (F006 page-test precedent)

## Implementation Steps
1. Write the integration test above (stub `URL.createObjectURL` + `document.execCommand` + clipboard
   as needed, matching component-test guards).
2. Run `npx vitest run` — fix any failures by the recommendations (loop until green).
3. Run `npx tsc --noEmit` then `npm run build` — 0 type errors.
4. Run `npx eslint` on new/modified files — clean.
5. Confirm parity test (`lib/i18n/dictionaries/parity.test.ts`) passes.

## Todo List
- [x] `kudos-compose.test.tsx` integration flow
- [x] `npx vitest run` 100% green (incl. all F006 tests unregressed)
- [x] `npx tsc --noEmit` + `npm run build` clean
- [x] `npx eslint` clean
- [x] i18n parity green

## Success Criteria
- All three gates pass; the end-to-end compose flow is proven; no F006 regression.

## Risk Assessment
- **Flaky async in integration test (Med):** always `await user.*`; use `findBy*` for post-submit
  assertions; fake timers for the toast auto-hide if needle-timed.
- **Hidden regression in F006 tests (Med):** run the WHOLE suite, not just new files.

## Security Considerations
- Test-only phase. None.

## Next Steps
- Feature complete. Update `docs/development-roadmap.md` / `project-changelog.md` (doc-writer) if in scope.
</content>
