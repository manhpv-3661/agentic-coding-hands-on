# Phase 04 — Hero keyvisual mini (`awards-hero`)

## Context Links
- Spec: FR-4 (hero keyvisual), FR-5 note (title is separate, inlined in Phase 05)
- Pattern refs: `app/components/home/hero-section.tsx` (Root-Further-Logo usage, containered layout), `app/page.tsx` lines 66–85 (Keyvisual-BG backdrop technique)
- Clarifications: reuse `public/homepage-saa/` assets

## Overview
- **Priority:** P2 · **Status:** done
- Static hero: `Keyvisual-BG.png` full-width cover bg + `Root-Further-Logo.png` +
  subtitle "Sun* Annual Award 2025". NO countdown / CTA / event-info (that's the
  homepage hero — do not reuse `hero-section.tsx`, it pulls in those widgets).

## Key Insights
- Homepage renders the keyvisual as an absolute backdrop behind header+hero
  (app/page.tsx). Here the awards hero is a self-contained section owning its own
  bg (cover, center-crop) — simpler, no shared backdrop layer needed.
- Purely presentational, server-renderable (no `"use client"`).

## Requirements
- **Functional (FR-4):** full-width banner, `Keyvisual-BG.png` cover center-crop; `Root-Further-Logo.png`; subtitle "Sun* Annual Award 2025"; alt text "Keyvisual Sun* Annual Award 2025". Static, non-interactive.
- **Non-functional:** responsive height (mirror homepage backdrop scale `h-[560px] sm:h-[760px] lg:...` — cap sensibly for a mini hero), Montserrat scoped, `mm:` comments, `priority` on the LCP image.

## Architecture
`<section>` relative, bg `<Image fill className="object-cover">` (alt="") + gradient overlay optional (match Figma), foreground centered logo `<Image>` + subtitle `<p>`. The single visible alt "Keyvisual Sun* Annual Award 2025" goes on the logo image (or an `aria-label` on the section) — FR-4 alt requirement.

Data flow: none (static). Rendered by Phase 05 page above the title.

## Related Code Files
- **Create:** `app/components/awards/awards-hero.tsx`
- **Create:** `app/components/awards/awards-hero.test.tsx`
- **Read for context:** `hero-section.tsx`, `app/page.tsx` (backdrop lines)
- **Assets:** `public/homepage-saa/Keyvisual-BG.png`, `Root-Further-Logo.png`

## Implementation Steps
1. Build section: relative container with responsive height; `Image fill object-cover` bg (`Keyvisual-BG.png`, alt=""); optional gradient overlay per Figma.
2. Foreground: centered `Root-Further-Logo.png` (`priority`) + subtitle text "Sun* Annual Award 2025"; set the FR-4 alt text on the meaningful image.
3. Scoped Montserrat + `mm:` node comments.

## Todo List
- [x] `awards-hero.tsx`
- [x] Test: renders bg image, logo, subtitle "Sun* Annual Award 2025"
- [x] Test: FR-4 alt text "Keyvisual Sun* Annual Award 2025" present
- [x] `npx tsc --noEmit` + vitest run

## Success Criteria
- Hero renders keyvisual + logo + subtitle; correct alt text; no countdown/CTA.
- Type-checks; tests green.

## Risk Assessment
- **Height/proportion vs Figma (Low/Low):** validate against MoMorph frame; reuse homepage backdrop scale as baseline.

## Security Considerations
- None (static assets).

## Next Steps
- Rendered by Phase 05 page composition (above the title section).
</content>
