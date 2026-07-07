# Phase 04 — Login Screen

**Priority:** P1 · **Status:** pending · **Effort:** 2h · **Depends on:** P3 · **Parallel-safe with:** P5,P6,P7

## Context Links
- Report: `research/researcher-01-login-contract.md` (live MoMorph, MCP reachable)
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
- Files: `app/login/page.tsx`, `app/login/components/login-header.tsx`

## Overview
Login already matches the live design closely. The real fix is the **systemic missing max-width
cap** — Login uses bare `PageGutter` with no `ContentFrame`, so content grows unbounded past
1152px on viewports >1440. Add the cap; remove the unsourced `max-w-[600px]`.

## Numeric Contract (live MoMorph — only 1440 exists in design)
| section | w×h | gutter/padding | gap | typography / notes |
|---|---|---|---|---|
| Root frame | 1440×1024 | — | — | bg `#00101A` |
| Header | 1440×80 | `12px 144px` | — | bg `rgba(11,15,18,.8)` |
| Main | 1440×845 | `96px 144px` | 120 | content 1152 (=1440−2×144) |
| Frame 487 | 1152×653 | 0 | 80 | vertically centered |
| Key Visual | 1152×200 | 0 | 24 | logo 451×200 |
| Frame 550 | 496×164 | `0 0 0 16px` | 24 | text + button |
| Subtitle | 480×80 | — | — | 20/40/700, +0.5px, Montserrat |
| Google button | 305×60 | `16px 24px` | 8 | 22/28/700, bg `#FFEA9E`, text `#00101A`, r8 |
| Footer | 1440×~91 | `40px 90px` | — | 16/24/700, Montserrat Alternates |

**Gutter verdict:** two intentional gutters — 144px (header/main, == `PageGutter lg:px-36`) and
90px (footer, correctly hardcoded outside `PageGutter`). **Single max-width = 1152px** for main.
1280/768/375 **not in design** → assert invariants only (P8), do not fabricate.

## Mismatches to fix (classified §5)
1. **Wrong max-width (systemic):** Login main has no `ContentFrame` cap → unbounded >1440.
   → Wrap main content in `ContentFrame width={1152}` (add 1152 to primitive if P1 kept it).
2. **Unsourced width token:** `LoginHeroContent max-w-[600px]` matches no Figma node → remove
   (children already narrower; currently inert).
3. **Unverifiable viewport classes:** `sm:`/base Tailwind values have no design backing (1440-only
   frame). Leave as reconstruction; flag in P8 as invariant-tested, not number-tested.

## Related Code Files
- Modify: `app/login/page.tsx` (add ContentFrame cap), possibly `login-hero-content.tsx` (drop max-w-600).
- Read: `login-header.tsx`, `login-footer.tsx`, `login-button.tsx` (verified correct — edit only on drift).

## Implementation Steps
1. Wrap login main content in `ContentFrame width={1152}` under the existing `PageGutter`.
2. Remove `max-w-[600px]` from `LoginHeroContent`.
3. Confirm header 144px gutter + footer 90px gutter unchanged (do not "fix" the footer to 144).
4. Lint/build; existing login tests + `e2e/login.spec.ts` stay green.

## Todo List
- [ ] Main capped at 1152 via ContentFrame
- [ ] max-w-[600px] removed
- [ ] Footer 90px gutter preserved
- [ ] Lint/build/tests green

## Success Criteria
- Content never exceeds 1152px past 1440 viewport; header/main gutter 144, footer 90; typography
  unchanged. P8 login assertions pass.

## Risk Assessment
- Adding 1152 cap could shift centered layout — verify vertical centering (gap 120/80) intact.

## Next Steps
Feeds P8 login assertions. Open Qs (from researcher) recorded in plan.md.
