# Reviewer Report — F004 Hệ thống giải thưởng (Awards Information)

## Scope
- Files: `app/awards/page.tsx`, `app/components/awards/{awards-catalog,awards-nav-menu,awards-hero,award-detail-card}.tsx(+.test.tsx)`, `award-detail-data.ts`, `hooks/use-scroll-spy.ts`, `tests/unit/{use-scroll-spy,awards-page}.test.tsx`, `e2e/awards-content.spec.ts`, `playwright.config.ts` (1-line-equivalent regex edit), `public/awards-saa/*.svg`
- LOC: all files 38–191 lines, all under the 200-line convention (largest: `use-scroll-spy.test.tsx` 191, `award-detail-card.tsx` 126)
- Focus: full read of every changed/new file + cross-reference against `spec/awards-page/feature.md` (FR-1..FR-16), `clarifications.md`, `plan.md`

## Overall Assessment
Clean, spec-faithful implementation. Slugs, descriptions, quantities/values all match FR-12 verbatim. RSC/client boundary is correct. Guard is intact. No security issues found. Tests assert real behavior, not tautologies. No blocking issues.

## Critical Issues
None.

## High Priority
None.

## Medium Priority
None found beyond what's already flagged as deliberate in the task brief (shared background image, shared unfinished descriptions, `<img>` for icons — all verified against spec/precedent, not re-flagged here).

## Low Priority
1. **Heading hierarchy skips h2** (`app/awards/page.tsx:67` `<h1>` → `award-detail-card.tsx:94` `<h3>`, no `<h2>` between). Spec only asks for "a sensible outline, not a strict rule," and the same pattern (no heading tags at all, or a skip) already exists in `hero-section.tsx` and `sun-kudos-section.tsx`, so this isn't a regression — just noting it's not a strict W3C-clean hierarchy. Not blocking.

## Edge Cases Found
- `hooks/use-scroll-spy.ts`: the render-phase `idsKey !== resolvedKey` reset branch (lines 48-52) never actually fires in this feature's usage, since `AwardsCatalog` passes a module-scope-stable `CATEGORY_SLUGS` array (`awards-catalog.tsx:14`) — the branch exists for hook generality/reuse, not exercised here. Confirmed intentional via the docstring, not a latent bug for this call site.
- `useScrollSpy`'s tie-break (first-match-in-`ids`-order wins when multiple sections intersect at once, `use-scroll-spy.ts:70`) is deterministic and tested (`use-scroll-spy.test.tsx:83-105`) — correctly satisfies FR-8's "only 1 active at a time" requirement, including the double-active scenario.
- `AwardsNavMenu` is a pure server-renderable component (no `"use client"`) even though it lives beside client components — confirmed it takes no client-only hooks, so this is correctly kept out of the client bundle boundary at the type level even though its parent (`AwardsCatalog`) is `"use client"` (a client component tree can render server-defined pure functions fine since they get bundled together; no issue, just confirming no client-only API leaked in).
- Verified no server-only import (`next/headers`, `next/navigation`, Supabase client) leaked into `app/components/awards/*` or `hooks/use-scroll-spy.ts` — grep clean.
- Verified `sun-kudos-section.tsx` has zero diff (`git diff HEAD -- app/components/home/sun-kudos-section.tsx` empty) — reused unmodified per FR-15.
- Verified all 6 slugs in `award-detail-data.ts` are sourced by index from `AWARD_CATEGORIES` (not re-typed strings) — a rename in `lib/awards/award-categories.ts` would propagate correctly, no drift risk.
- Verified homepage's F002 dependency: `award-card.tsx`/`awards-section.tsx` build `detailsHref` as `` `/awards#${AWARD_CATEGORIES[index]?.slug ?? ""}` `` from the same shared array — the hash-anchor contract holds by construction, not by coincidence of matching strings.
- Verified all referenced assets exist on disk: `public/awards-saa/Icon-{Target,Diamond,License}.svg` and all `public/homepage-saa/Award-Name-*.png` + `Keyvisual-BG.png` + `Root-Further-Logo.png` + `Award-BG.png` referenced by `award-detail-data.ts` / `awards-hero.tsx` / `award-detail-card.tsx`.
- `requireUser()` (`lib/auth/require-user.ts`) unchanged, called once at top of `AwardsPage` before any render (`app/awards/page.tsx:47`) — redirect-on-no-session path intact, defense-in-depth alongside untouched `proxy.ts`.
- No `dangerouslySetInnerHTML`, no string-built queries, no secrets — all copy is static string literals from spec, all images are static-path constants or props sourced from the static `AWARD_DETAIL_ENTRIES` array (not user input).

## Positive Observations
- Docstrings throughout explicitly cite spec FR numbers and MoMorph node IDs — makes the spec-to-code mapping auditable without re-deriving it.
- `award-detail-data.ts` derives slugs from `AWARD_CATEGORIES[i].slug` by index rather than retyping strings — eliminates a whole class of typo/drift risk between this file and the homepage's F002 grid.
- Test suite is behavior-focused, not implementation-focused: `awards-nav-menu.test.tsx` asserts hrefs/aria-current by category data, not by hardcoded strings; `use-scroll-spy.test.tsx` covers the empty-ids, missing-DOM-node, no-IntersectionObserver, and unmount-cleanup edge cases (FR-10) with a real mock observer rather than shallow stubs.
- E2E spec (`awards-content.spec.ts`) exercises real passive scroll-spy activation (`scrollIntoViewIfNeeded` + `aria-current` assertion) in addition to click-driven activation — matches the "real IntersectionObserver, not click-only" decision from clarifications.
- `AwardsNavMenu` correctly stays a plain function component (no unnecessary `"use client"`) since it's pure w.r.t. props — good instinct to minimize client bundle surface.

## Recommended Actions
None blocking. Optional/non-blocking: consider a `<h2>` wrapper if a future accessibility audit tightens heading-hierarchy rules — not required by this spec or by existing codebase convention.

## Metrics
- Type Coverage: not independently re-measured (author confirms `tsc --noEmit` clean)
- Test Coverage: not independently re-measured (author confirms 202/202 vitest, 37/37 playwright)
- Linting Issues: not independently re-measured (author confirms 0 errors, 3 pre-existing-pattern warnings)
- Files reviewed: 15 (7 source, 4 unit test, 1 hook, 1 hook test, 1 e2e spec, 1 config diff)

## Unresolved Questions
None.

## Verdict
DONE. No critical or high-priority issues. Feature is spec-compliant, secure, and architecturally sound. Cleared for delivery.
