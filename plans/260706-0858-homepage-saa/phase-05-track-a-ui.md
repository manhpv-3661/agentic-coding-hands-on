# Phase 05 — Track A: Homepage UI (PARALLEL)

MoMorph screen — built by a parallel background `implementer` agent via `momorph-implement-design`.
NOT a blocking dependency (no blocks/blockedBy vs Track B). Consumed at P06.

## MoMorph refs
- Homepage SAA: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
- Clarifications: `plans/260706-0858-homepage-saa/clarifications.md`

## Goal
✅ **COMPLETE** — Pixel-perfect presentational homepage (header A1, hero+countdown B1-B3, Root-Further B4, awards
grid C1/C2, Kudos D1/D2, floating widget 6, footer 7) using Figma content as mock data. All 6 sections built and composed into `app/page.tsx`.

## Out of scope (Track B owns — wired at integration)
- Auth/guard, proxy, redirects (P01) · countdown env+ticking logic (P02) · `/awards`,`/kudos`
  route behavior + slug source (P03) · sign-out action + dismissable-menu hook (P04).

## Integration contract (report back to orchestrator)
- Files created + component tree.
- Props each component expects — especially: countdown display (`days/hours/minutes/showComingSoon`
  strings), award card (`slug`, `title`, `href`), account menu (sign-out handler slot), any menu
  (open-state/trigger slot), nav link `href`s.
- Use `<button>` for menu triggers (keyboard). Reuse `app/login/components/` where sensible.

## Actual Outcome
✅ Track A UI complete.
- **Files created:** `app/components/home/` directory with section components:
  - `header.tsx` (logo, language selector, account/bell menus)
  - `hero-countdown.tsx` (countdown display)
  - `root-further.tsx` (content section)
  - `awards-grid.tsx` (6 award cards)
  - `kudos-section.tsx` (kudos content)
  - `footer.tsx` (footer links)
  - `floating-widget.tsx` (widget button)
- **Composition:** all 6 sections composed into `app/page.tsx` with proper layout and spacing.
- **Visual validation:** cross-section layout fixes applied; validated against Figma at 3 viewports (mobile, tablet, desktop).
- **Mock data:** extracted from Figma design content (text, placeholder images, sample values).
- **Integration contract fulfilled:** component interfaces defined for Track B wiring (countdown props, award card hrefs, menu state/handlers).
