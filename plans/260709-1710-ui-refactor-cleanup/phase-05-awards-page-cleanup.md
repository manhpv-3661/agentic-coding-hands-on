# Phase 05 — Awards page cleanup (group e)

## Context Links
- Plan: [plan.md](plan.md) · Depends on: [phase-03](phase-03-awards-components-dedup.md)
- Specs: f004-awards-information (behavior unchanged)

## Overview
- **Priority:** P3 (smallest) · **Status:** done · **Depends on:** 03
- **Description:** Tidy `app/awards/page.tsx` — align imports with phase-03 changes, remove stale dead documentation. No behavior change.

## Key Insights
- `app/awards/page.tsx` has NO real inline logic — standard `getLocale`/`getDictionary`/`getAwardCategories` → `buildAwardDetailEntries` → `<AwardsCatalog>` composition (same shape as `app/page.tsx`).
- **Stale comment block (lines ~103-108)** documents an eyebrow/heading section whose actual JSX is ABSENT from the file. Either dead documentation OR a dropped-markup regression.
  - **This is NOT a refactor fix.** Do NOT re-add markup or guess. Confirm with feature owner (unresolved Q). If confirmed stale → delete the dead comment only. If regression → hand to feature track, out of scope here.
- After phase 03 removes the type re-export hop, ensure `page.tsx` imports (if any type imports) point at the correct module.

## Requirements
- No behavior change; awards page server-renders identical output.
- Depends on phase 03 (shared meta lib + import repoint landed) to avoid import churn/conflict.

## Architecture
Composition pipeline unchanged. Only comment hygiene + import path alignment.

## Related Code Files
**Modify:** `app/awards/page.tsx`.
**Create/Delete:** none.
**Do NOT touch:** `awards-hero.tsx` offset bug (separate layout track).

## Implementation Steps
1. Confirm with feature owner: is the eyebrow/heading section supposed to render? (unresolved Q)
2. If stale → delete the dead comment block. If regression → STOP, escalate, leave as-is.
3. Verify no import references the removed award type re-export hop; repoint if needed.
4. `npm run lint && npm run test && npm run build`.

## Todo List
- [x] eyebrow/heading comment resolved (stale vs regression) with owner
- [x] dead comment removed (only if confirmed stale)
- [x] imports aligned with phase-03
- [x] lint + test + build green

## Success Criteria
- Awards page output byte-identical (SSR) to pre-refactor.
- No stale documentation for markup that does not exist.
- Any awards page e2e/layout-contract test still passes.

## Tests (add/update)
- No new unit test (page is thin composition; behavior covered by component tests + existing e2e/layout-contract tests).
- Confirm existing awards e2e/contract tests green.

## Risk Assessment
| Risk | L | I | Countermeasure |
|------|---|---|----------------|
| Treating a regression as "stale comment" and deleting evidence | Med | High | Gate step 2 on owner confirmation; default = leave untouched |
| Import repoint misses a path after phase-03 | Low | Low | Build catches; run tsc/build |

## Security Considerations
None — server component composition only; no auth/data-path change.

## Next Steps
Final phase. On completion, run full `npm run test` + `npm run e2e` (layout contract) to confirm the whole refactor introduced zero behavior/layout change.
