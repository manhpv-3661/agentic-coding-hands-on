# Project Changelog

Running record of significant changes, features, and fixes. Newest entries first.

## 2026-07-07 — Site visual fidelity fixes (F002/F004/F005/F006/F007 pixel audit)

Full-site pass closing the "80% matching the design" gap the product owner flagged
against the live MoMorph ground truth for the Homepage, Awards, site chrome
(header/footer), and Kudos screens. Seven phases: font wiring, avatar/gallery
image reversal, and per-screen pixel audits (Home, Awards, Chrome, Kudos), closed
out here with a full-site re-verification and integration pass.

**Font wiring**
- Montserrat is now the global default font (`app/layout.tsx` + `app/globals.css`),
  replacing the `create-next-app` Geist boilerplate; real brand metadata
  ("Sun* Annual Awards 2025") replaces the default title/description.
- Montserrat Alternates now includes the `"vietnamese"` subset for bilingual VI/EN
  copy.
- Countdown digit glyphs (Homepage hero + Prelaunch countdown) now render in
  "Digital Numbers" — the font Figma specifies — self-hosted via `next/font/local`
  (`app/fonts/digital-numbers/DigitalNumbers-Regular.ttf`, SIL OFL 1.1) since the
  family isn't published to the live Google Fonts CDN yet. Verified against
  MoMorph ground truth: 49.152px (Homepage) / 73.728px (Prelaunch), weight 400,
  matching the digit-box sizing exactly (font size and box are Figma-paired
  values, so glyph fit has zero drift risk).

**Avatar / gallery images**
- Reversed the original "initials/placeholder" assumption for Kudos avatars and
  the gallery: real cropped photos (`public/kudos/avatars/*.jpg`,
  `public/kudos/gallery/photo-1.jpg`) are the correct, final assets — initials
  render only as a genuine per-image fallback (blank/whitespace name), not a
  global default.

**Full-site pixel audit**
- Homepage: zero drift found against ground truth across hero, countdown,
  event info, CTA buttons, awards section, Sun Kudos section, and the floating
  widget button.
- Awards page: fixed a double-applied 144px gutter (`max-w` + `mx-auto` stacked
  on top of `lg:px-36`, shrinking content to 864px instead of 1152px), centered
  the title/eyebrow block, corrected the nav menu's font-weight/letter-spacing,
  and closed several award-detail-card gaps (background photo position,
  description weight/justification, icon-row gaps, content-group dividers,
  quantity/value label-vs-value typography split). A follow-up full-site pass
  (this phase) additionally corrected the awards-catalog two-column gap (effective
  121px, not the naively-computed 80px, due to `justify-content: space-between`
  interacting with two fixed-width columns) and re-derived the hero cover
  gradient's stop percentages, which had been miscalculated during the original
  per-screen pass.
- Site chrome: header was already ground-truth conformant; fixed the footer's
  nav-link border-radius (0px per design, was inheriting the header's 4px).
  Confirmed structural parity across `/`, `/awards`, and `/kudos` — all three
  pages render the same `SiteHeader`/`SiteFooter` components, so chrome
  consistency is guaranteed by shared-component reuse, not per-page styling.
- Kudos: fixed sidebar stats-box row/divider spacing, gift-recipients box
  padding, and the Spotlight board's "388 KUDOS" counter (was 24px gold, is
  36px/44 white per ground truth).

**Known, accepted gaps (not closed this phase)**
- Awards quantity/value metadata: Figma splits the number (36px) from its
  unit/qualifier phrase (14px) as two text nodes; the current data model
  (`award-detail-data.ts`) holds each as one combined string, so a single
  24px size is used as the closest single-size approximation. Closing this
  fully requires a data-model change (splitting the fields), which is out of
  this phase's scope.
- Awards catalog: Figma authors two visually distinct card sub-layouts across
  the 6 award entries; this codebase intentionally uses one shared
  `AwardDetailCard` component per the plan's own requirement, so per-variant
  pixel-parity isn't simultaneously achievable with that constraint.
- Kudos: the Highlight carousel's gradient-fade mask blend, the Spotlight
  name-cloud's algorithmic (non-deterministic-vs-Figma) placement, and one
  sub-pixel search-pill scale artifact are not verifiable through static
  analysis and would need a live-browser render to confirm.

Docs impact: minor — this changelog entry is new (file didn't previously
exist); no architecture or API documentation changed.
