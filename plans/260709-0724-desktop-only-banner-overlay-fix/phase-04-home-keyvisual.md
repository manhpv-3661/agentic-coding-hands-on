# Phase 04 — Home keyvisual exact-size + responsive strip

**Priority:** P1 · **Status:** done · **Effort:** 3h · **Depends on:** P1 · **Parallel-safe with:** P2,P3,P5

## Context Links
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
- Files: `app/page.tsx`, `app/components/home/hero-section.tsx` (+ home children)

## Numeric Contract (live MoMorph — 1512 only)
| element | box | notes |
|---|---|---|
| Root frame | 1512×4480 | bg `#00101A` |
| Keyvisual photo `2167:9028` | 0,0 → **1512×1392** | behind header+hero |
| Cover gradient `2167:9029` | 0,0 → **1512×1480** | `linear-gradient(12deg,#00101A 23.7%,rgba(0,18,29,.46) 38.34%,rgba(0,19,32,0) 48.92%)` |
| Hero content frame | 1224 | logo 451×200, countdown y=472, CTA y=735 |

## Overview
Home is the closest to correct: the keyvisual photo + gradient are already absolutely positioned
`-z-10` behind the header + hero, and hero content already composites over them. The work is (1)
drop the responsive height tiers to the single native 1512 values, and (2) strip responsive from
the home component set. No structural overlay rebuild needed — the compositing is already right.

## Key Insights
- `app/page.tsx` backdrop: photo box `h-[560px] sm:h-[760px] lg:h-[1392px]` → `h-[1392px]`;
  gradient box `h-148.75 sm:h-202 lg:h-370` → `h-370` (= 1480px). `<main>` `gap-12 py-12 sm:…
  lg:gap-[120px] lg:py-24` → `gap-[120px] py-24`.
- Home is the only 1512-native screen — content caps are tiered 1224/1152/1120 (already correct).
- Heaviest responsive surface: `sun-kudos-section.tsx` (28), `root-further-content.tsx` (20) —
  both home-owned here. `root-further-content.tsx`'s `lg:px-[104px] lg:py-[120px]` is a documented
  Figma interior-card padding exception → collapse to the non-prefixed `px-[104px] py-[120px]`
  (keep the padding, drop the breakpoint), NOT delete it.

## Requirements
- Keyvisual photo box = 1512×1392, gradient box = 1512×1480, exact.
- Hero content stays composited over the `-z-10` backdrop (unchanged structure).
- Zero responsive variants in the owned files (interior-card paddings preserved, un-prefixed).

## Architecture / Data Flow
`HomePage` outer div → two absolute `-z-10` backdrop boxes (photo 1392, gradient 1480, shared
origin) → `SiteHeader` (semi-transparent, over backdrop) → `<main>` sections (hero/root-further/
awards/kudos) each `PageGutter>ContentFrame(tier)` composited over the backdrop → footer + widget.

## Related Code Files
- Modify: `app/page.tsx` (backdrop heights + main rhythm → native), `hero-section.tsx`,
  `countdown-timer.tsx`, `event-info.tsx`, `hero-cta-buttons.tsx`, `awards-section.tsx`,
  `root-further-content.tsx`, `sun-kudos-section.tsx` (strip responsive).
- Do NOT edit: `site-header.tsx`/`site-footer.tsx` (P1-owned).

## Implementation Steps
1. `app/page.tsx`: photo box → `h-[1392px]`; gradient box → `h-370`; `<main>` →
   `gap-[120px] py-24`. Backdrop stays absolute `-z-10`; hero compositing unchanged.
2. Strip responsive from `hero-section.tsx` (logo `w-[240px] sm:… lg:w-[451px]` → `w-[451px]`) and
   `countdown-timer.tsx`, `event-info.tsx`, `hero-cta-buttons.tsx`, `awards-section.tsx`.
3. `root-further-content.tsx`: collapse breakpoints to desktop; KEEP interior padding un-prefixed
   (`px-[104px] py-[120px]`), it is a design node padding not a viewport gutter.
4. `sun-kudos-section.tsx`: collapse all 28 breakpoints to desktop values.
5. Lint + build.

## Todo List
- [ ] Keyvisual photo 1512×1392 + gradient 1512×1480 (native, non-responsive)
- [ ] Hero content still composited over `-z-10` backdrop
- [ ] Responsive stripped across all 8 owned files
- [ ] root-further interior padding preserved (un-prefixed)
- [ ] lint + build green

## Success Criteria
- Backdrop boxes measure native heights; hero logo/countdown/CTA render over them; no `sm:`/`lg:`
  remain. P6: header gutter 144; hero/awards/kudos-outer 1224, root-further 1152, kudos-inner 1120.

## Risk Assessment
- `sun-kudos-section.tsx` has the most breakpoints (28) → highest chance of a missed variant;
  grep-verify zero remain.
- Interior-card padding accidentally deleted (vs un-prefixed) would shrink the root-further card —
  explicit step 3 guards this; P6 `expectNoNestedGutterClass` (not `expectNoDoubleGutter`) applies.

## Next Steps
Feeds P6 home assertions (asserted at 1512).
