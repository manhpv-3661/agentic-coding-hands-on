# Phase 04 — Integration verification + docs

## Context Links
- All prior phases (01–03) · `.claude/rules/documentation-management.md`
- Docs: `docs/project-changelog.md`, `docs/development-roadmap.md` (update if present)

## Overview
- **Priority:** P2 · **Status:** pending
- Prove the whole feature holds together (full test suite + build), then record it in the changelog.
- Depends on: **01, 02, 03** all complete.

## Key Insights
- No backend, no migration, no config change — "integration" here is: full `vitest` green + `next build`
  clean + a manual reload check for persistence (the one behavior unit tests can't fully assert e2e).

## Requirements
- Whole suite passes (no regressions in the other kudos components).
- Production build compiles (Next 16 / React 19).
- Changelog entry added for F008.

## Related Code Files
- **Modify:** `docs/project-changelog.md` — add F008 entry.
- **Modify (if it tracks features):** `docs/development-roadmap.md` — mark F008 done.
- No code files owned by this phase (verification only).

## Implementation Steps
1. `npm run test` — full suite green.
2. `npm run build` — no type/compile errors.
3. `npm run lint` — no new errors in touched files.
4. Manual check (dev): like a card, reload → heart stays liked; like a card, unlike, reload → not liked; own post heart is disabled.
5. Add a `docs/project-changelog.md` entry: "F008 — Like Kudos: heart toggle on Kudos cards, localStorage-persisted, own-post guard." Update roadmap status if that file lists features.

## Todo List
- [ ] Full `vitest` suite green
- [ ] `next build` clean
- [ ] Lint clean on touched files
- [ ] Manual persistence + own-post disabled check
- [ ] Changelog (+ roadmap) updated

## Success Criteria
- Zero failing tests; zero build errors; changelog reflects F008.

## Risk Assessment
- **Regression in shared `KudosCard` consumers (Med/Med):** the full suite (spotlight, banner, page-client, etc.) is the guard — run it, don't cherry-pick.
- **localStorage unavailable in test env (Low/Low):** jsdom provides it; hook's try/catch covers prod edge cases.

## Security Considerations
- Confirm no secrets/PII written to localStorage (only post-id strings).

## Next Steps
- Feature complete. Hand to `reviewer` per primary workflow.
