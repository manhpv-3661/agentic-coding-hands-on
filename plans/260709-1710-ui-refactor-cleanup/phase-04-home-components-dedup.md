# Phase 04 — Home components dedup (group d)

## Context Links
- Plan: [plan.md](plan.md) · Foundation: [phase-00](phase-00-shared-primitives-foundation.md)
- Specs: f002-homepage (behavior unchanged)

## Overview
- **Priority:** P2 · **Status:** done · **Depends on:** 00 (and 03 for ONE item — see below)
- **Description:** Dedup icons/glow/panel chrome, unify the two nav-link impls, split the 3-concern widget-button — inside `app/components/home/` only.

## Key Insights

### Dead code (drop `export`, types only-local — no behavior change)
`CountdownTimerProps` (countdown-timer.tsx:23), `EventInfoProps` (event-info.tsx:1), `HeroCtaButtonsProps` (hero-cta-buttons.tsx:29), `HeroSectionProps` (hero-section.tsx:8), `AwardsSectionProps` (awards-section.tsx:80), `RootFurtherContentProps` (root-further-content.tsx:40). (`AwardCardProps` is genuinely reused — keep.)
- `CountdownTimer.eventStartAt` (countdown-timer.tsx:28) declared, never passed by caller `hero-section.tsx:71` (only used in tests). Dead plumbing at call site — **confirm with spec before removing**; default keep (low value, behavior-adjacent).

### Duplication
- **Up-chevron SVG** identical 3×: `award-card.tsx:35-52` (`IconUp`), `hero-cta-buttons.tsx:10-27` (`IconUp`), `sun-kudos-section.tsx:20-37` (`UpArrowIcon`) → extract `home/up-chevron-icon.tsx`, delete 3 locals.
- **Gold-glow literal** 4× in home (nav-link:42, site-footer:45, widget-button:161, award-card:84) → use `GOLD_GLOW_*` from phase-00.
- **Dismissable-panel chrome** `rounded-lg border border-[#2E3940] bg-[#101317] ... shadow-lg` 3× (account-menu-button:78, notification-bell:82, widget-button:184; differ only width/padding) → shared `home/dismissable-panel.tsx` wrapper (children + className).
- **Two nav-link impls**: `nav-link.tsx` (`NavLink`) vs `FooterNavLink` inside `site-footer.tsx:32-52` — both wire `useScrollToTopOnHomeClick` + `aria-current` + identical active-state gold textShadow, differ only radius/size. → parameterize `nav-link.tsx` with a `variant`/style prop; `site-footer.tsx` consumes it, delete local `FooterNavLink`.
- **`isActive` helper** dup: site-header.tsx:51-52 vs site-footer.tsx:87-88 (only `?.`/`?? false` differs) → single helper (co-locate with nav-link primitive; align null-safety to the safer `?.`/`?? false`). Verify no behavior change (safer variant returns false where unsafe would throw — currently header uses safe, footer assumes defined; confirm pathname always defined at footer).
- `cn()` idiom sites → adopt `lib/ui/cn`.

### Merge / split
- **`widget-button.tsx` (191 lines) = 3 concerns**: (a) `PenIcon` (16-36) + `KudosLogoSmallIcon` (46-123, ~80 lines pure SVG); (b) floating trigger (149-177); (c) dismissable stub panel (178-190). → extract the 2 icons to `home/widget-button-icons.tsx`; adopt shared `dismissable-panel`. Cuts file ~half.

### Keep-as-is
`countdown-timer.tsx`/`event-info.tsx`/`hero-cta-buttons.tsx` (single-parent but real logic/tests), `award-card.tsx` (mapped 6×), `site-header.tsx` (thin composition root).

### Flagged, NOT done here (judgment/ownership)
- Reusing `kudos/kudos-section-heading.tsx` for `awards-section.tsx:120-134` heading block — cross-ownership move, defer.
- Per-component `montserrat` className boilerplate — deliberate self-contained decision per in-file comments; leave.

## Cross-phase item (depends on phase 03)
`awards-section.tsx:32-39` `AWARD_CARD_META` + skip-warn guard (61-66) → migrate to `lib/awards/award-category-meta.ts` (CREATED by phase 03). This ONE step is blockedBy phase 03. Everything else in phase 04 is independent of 03. If 03 not yet done, skip this step and leave the local map (revisit after 03).

## Requirements
- No behavior change; header/footer nav active states, hero, countdown, panels, widget behave identically.

## Related Code Files
**Modify:** award-card.tsx, hero-cta-buttons.tsx, sun-kudos-section.tsx, nav-link.tsx, site-footer.tsx, site-header.tsx, account-menu-button.tsx, notification-bell.tsx, widget-button.tsx, awards-section.tsx (+ countdown/event/hero-section/root-further-content for de-export only).
**Create:** `home/up-chevron-icon.tsx`, `home/dismissable-panel.tsx`, `home/widget-button-icons.tsx`.
**Delete:** none (locals inlined/removed within their files).

## Implementation Steps
1. Extract `up-chevron-icon.tsx`; repoint 3 consumers; delete locals.
2. Adopt `GOLD_GLOW_*` at 4 sites.
3. Create `dismissable-panel.tsx`; adopt in account-menu-button, notification-bell, widget-button.
4. Parameterize `nav-link.tsx`; delete `FooterNavLink`; unify `isActive` helper.
5. Extract `widget-button-icons.tsx`; slim widget-button.
6. De-export the 6 local-only prop interfaces.
7. (If phase 03 done) migrate home meta map to shared lib.
8. Adopt `cn()`; `npm run lint && npm run test && npm run build`.

## Todo List
- [x] up-chevron extracted, 3 locals gone
- [x] gold-glow constant adopted (4 sites)
- [x] dismissable-panel created + adopted (3)
- [x] nav-link parameterized, FooterNavLink removed, isActive unified
- [x] widget-button icons extracted, file <120 lines
- [x] 6 props de-exported
- [x] (opt) home meta migrated to shared lib
- [x] cn() adopted
- [x] tests + lint + build green

## Success Criteria
- `account-menu-button.test.tsx`, `award-card.test.tsx`, `awards-section.test.tsx`, `countdown-timer.test.tsx`, `event-info.test.tsx`, `hero-cta-buttons.test.tsx`, `hero-section.test.tsx`, `nav-link.test.tsx`, `notification-bell.test.tsx`, `root-further-content.test.tsx`, `site-footer.test.tsx`, `site-header.test.tsx`, `sun-kudos-section.test.tsx`, `widget-button.test.tsx` pass unchanged.
- Header & footer nav active-state highlighting identical; panels open/dismiss identically.

## Tests (add/update)
- **New:** `up-chevron-icon.test.tsx`, `dismissable-panel.test.tsx` (children + className), `widget-button-icons.test.tsx`.
- **Update:** `site-footer.test.tsx` if `FooterNavLink` removal changes internal structure (assert same rendered output/active state).
- **Update:** `nav-link.test.tsx` to cover the new `variant` prop (header vs footer style) without changing default behavior.

## Risk Assessment
| Risk | L | I | Countermeasure |
|------|---|---|----------------|
| Unified `isActive` null-safety changes footer active state | Med | Med | Confirm pathname defined at footer; test both header & footer paths |
| nav-link variant refactor shifts footer link radius/size | Med | Med | variant carries exact old classes; snapshot both variants |
| dismissable-panel wrapper loses a per-site padding/width | Med | Med | Pass width/padding via className; assert each site unchanged |
| Removing `eventStartAt` breaks a test-only path | Low | Low | Keep unless spec confirms dead; tests use it |

## Security Considerations
None — presentational only. `useDismissableMenu`/`useScrollToTopOnHomeClick` behavior must stay identical (do not modify the hooks).

## Next Steps
Parallel-safe with 01/02; the meta-migration sub-step waits on 03.
