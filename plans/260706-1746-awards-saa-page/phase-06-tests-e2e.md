# Phase 06 — E2E + regression

## Context Links
- Spec: section 4 (DoD), FR-3, FR-7, FR-8, FR-14, FR-15
- Depends: Phase 05 (page live)
- Pattern refs: `e2e/homepage-content.spec.ts` (authless project, selectors from source, `toBeInViewport`), `e2e/homepage-access.spec.ts`, `e2e/access-control.spec.ts`, `playwright.config.ts` (chromium-authless project @ :3100)

## Overview
- **Priority:** P2 · **Status:** done
- Playwright E2E for `/awards`: nav click → scroll + active, scroll-spy passive
  active change, hash-anchor from Homepage, Sun* Kudos "Chi tiết" → `/kudos`.
  Access-control regression is already covered by F002 specs — just verify no
  regress.

## Key Insights
- E2E runs against the `chromium-authless` project (baseURL `:3100`, no Supabase)
  where `requireUser()` fails open — same setup homepage content specs use. Source
  every selector/string from the built components (read, don't guess).
- `toBeInViewport()` is the homepage pattern for asserting scroll landed.

## Requirements
- **Functional (spec §4):**
  1. `/awards` renders full content authenticated (authless project): header, hero, title, 6 sections by id, Sun* Kudos, footer.
  2. Click each of the 6 nav items → correct `#slug` section in viewport + that nav item active (`aria-current`).
  3. Scroll-spy: scrolling to a section (without click) sets its nav item active (single active).
  4. Hash-anchor: `goto('/awards#<slug>')` lands on the right section (FR-14) for a sample slug (e.g. `mvp`).
  5. Sun* Kudos "Chi tiết" → navigates to `/kudos` (FR-15).
  6. Access-control regression: `/awards` unauth → `/login` — verify existing `e2e/access-control.spec.ts` / `homepage-access.spec.ts` still green (no new spec needed unless a gap).
- **Non-functional:** deterministic waits (`toBeInViewport`, `waitForURL`), no arbitrary sleeps.

## Architecture
New spec `e2e/awards-content.spec.ts` mirroring `homepage-content.spec.ts`
structure (describe block, `page.goto('/awards')`). Selectors: `#<slug>` sections,
`nav[aria-label="Award categories"] a`, `aria-current`, kudos `a[href="/kudos"]`.

## Related Code Files
- **Create:** `e2e/awards-content.spec.ts`
- **Read for context:** `e2e/homepage-content.spec.ts`, `playwright.config.ts`, built `app/awards/page.tsx` + `app/components/awards/*`
- **Verify no regress (do not necessarily edit):** `e2e/access-control.spec.ts`, `e2e/homepage-access.spec.ts`

## Implementation Steps
1. Write `awards-content.spec.ts`: render check (all sections + kudos + footer).
2. Loop 6 slugs: click nav anchor → `expect(#slug).toBeInViewport()` + nav item `aria-current`.
3. Scroll-spy passive test: `#mvp` scrollIntoView → assert mvp nav active; assert only one `[aria-current]` at a time.
4. Hash-anchor test: `goto('/awards#mvp')` → `#mvp` in viewport.
5. Kudos CTA: click "Chi tiết" in kudos section → `waitForURL(/\/kudos$/)`.
6. Run access-control specs → confirm green (regression gate).

## Todo List
- [x] `e2e/awards-content.spec.ts` (render, 6 nav click→scroll+active, scroll-spy passive, hash-anchor, kudos CTA)
- [x] Confirm single-active invariant asserted (`[aria-current]` count === 1 after settle)
- [x] Run full `npx playwright test` — awards specs + no regression in access/homepage specs
- [x] Hand to `tester` agent for final run against final code

## Success Criteria
- All new E2E pass; existing access-control + homepage specs still pass.
- Nav click and passive scroll both drive active state; hash-anchor lands right; kudos routes to `/kudos`.

## Risk Assessment
- **Scroll-spy timing flake (Med/Med):** IO active-change is async; use `expect.poll`/`toBeInViewport` auto-retry, avoid fixed sleeps. Assert active AFTER scroll settles.
- **Authless env mismatch (Low/Low):** follow homepage-content precedent exactly (`:3100` project).

## Security Considerations
- Access-control regression explicitly verified (unauth → `/login`). No secrets in specs.

## Next Steps
- On green: update `docs/` if needed (Docs impact assessment) and close the plan.
</content>
