# Phase 02 — Login banner overlay + responsive strip

**Priority:** P1 · **Status:** done · **Effort:** 2h · **Depends on:** P1 · **Parallel-safe with:** P3,P4,P5

## Context Links
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
- Files: `app/login/page.tsx`, `app/login/components/login-hero-content.tsx`

## Numeric Contract (live MoMorph — 1440 only)
| element | box | crop / notes |
|---|---|---|
| Root frame | 1440×1024 | bg `#00101A` |
| Keyvisual "image 1" `662:14389` | 0,2 → **1441×1022** | `-440px -217.975px / 159.763% 133.371%` |
| Logo (Root Further) | 451×200 | overlay |
| Subtitle | 480×80 | 20/40/700 +0.5px |
| Google button | 305×60 | bg `#FFEA9E` |
| Footer | 1440×~91 | gutter **90** (keep) |

## Overview
Login already visually overlays text on the bg (content flows over a CSS `bg-cover` background),
but the bg is a `bg-cover bg-right` approximation, not the exact 1441×1022 crop. Rebuild the
keyvisual as an explicitly-sized box with the exact crop transform applied, keep the text
composited on top, and strip login's responsive variants.

## Key Insights
- Current: `bg-[linear-gradient(...),url('/login/hero-waves.jpg')] bg-cover bg-right` on the outer
  flex wrapper; content inside `PageGutter>ContentFrame(1152)` flows over it.
- `hero-waves.jpg` is a substitute crop (Figma media auth broken) → the literal crop transform
  can't match the original. **Size the box exactly (1441×1022); crop transform is a documented
  reconstruction tuned to the substitute** (do not claim pixel-perfect — Open Q #2).
- `login-hero-content.tsx` has responsive gaps (`gap-10 sm:gap-16 lg:gap-20`) and responsive logo
  width (`w-[240px] sm:w-[340px] lg:w-[451px]`) → collapse to desktop (`gap-20`, `w-[451px]`).

## Requirements
- Keyvisual is a sized element (1441×1022 box), not `bg-cover` on the page wrapper.
- Text block (logo 451×200 + subtitle 480×80 + button) composited over the keyvisual, z-ordered
  image → dark scrim/Cover gradient → text.
- Zero responsive variants remain in the two owned files.

## Architecture / Data Flow
`LoginPage` outer div (solid `#00101A`) → absolutely-positioned keyvisual box (image + Figma
scrim + Cover gradient) as the backdrop layer → `PageGutter>ContentFrame(1152)` content layer
composited on top (existing Cover bottom-fade overlay + footer paint order preserved).

## Related Code Files
- Modify: `app/login/page.tsx` (replace `bg-cover` wrapper with sized keyvisual box; strip 1
  responsive class on `<main>` `py-12 lg:py-24` → `py-24`), `login-hero-content.tsx` (strip 4
  responsive variants).
- Read: `login-header.tsx`, `login-footer.tsx`, `login-button-container.tsx` (no responsive; edit
  only on drift).

## Implementation Steps
1. Replace the outer-div `bg-[…]/bg-cover/bg-right` with a dedicated absolutely-positioned
   keyvisual box sized 1441×1022, carrying the image + Figma scrim (`Rectangle 57` fade) + Cover
   gradient (`662:14390`) in paint order; keep the existing bottom-fade overlay.
2. Keep `PageGutter>ContentFrame(1152)` content as the top layer (already overlays the backdrop).
3. `login-hero-content.tsx`: `gap-10 sm:gap-16 lg:gap-20` → `gap-20`; logo `w-[240px] sm:w-[340px]
   lg:w-[451px]` → `w-[451px]`.
4. `page.tsx`: `py-12 lg:py-24` → `py-24`.
5. Lint + build. (Login e2e assertions land in P6.)

## Todo List
- [ ] Keyvisual rebuilt as sized 1441×1022 box (crop labeled reconstruction)
- [ ] Text block composited on top (paint order image→scrim→Cover→text)
- [ ] Responsive variants stripped (page + hero-content)
- [ ] lint + build green

## Success Criteria
- Keyvisual box measures ~1441×1022; logo/subtitle/button render over it; no `sm:`/`lg:` remain.
- P6: title block rect ⊆ keyvisual rect; gutter 144, content 1152, footer 90.

## Risk Assessment
- Substitute-crop transform can't match Figma exactly (asset auth) → reconstruction, flagged.
- Absolute keyvisual box vs. min-h-screen flow could clip on short viewports → box is backdrop
  layer, content keeps its own flow height.

## Next Steps
Feeds P6 login assertions.
