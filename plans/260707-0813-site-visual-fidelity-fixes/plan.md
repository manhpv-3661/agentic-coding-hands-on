---
title: "Site-wide Visual Fidelity Fixes (font + real images + full-site pixel audit)"
description: "Wire the Montserrat brand font globally, formalize real avatar/gallery photos, and run a real-measurement pixel-conformance audit across the whole site."
status: completed
priority: P1
effort: 18h
branch: main
work_type: fix
tags: [visual-fidelity, momorph, font, images, pixel-conformance]
created: 2026-07-07
---

# Site-wide Visual Fidelity Fixes

Product owner reports the shipped SAA 2025 site diverges from the MoMorph design: wrong font,
placeholder-looking avatars/gallery images, and padding/margin/layout drift across most pages.
Root-cause investigation (this session, evidence not speculation) found **3 confirmed causes**,
each mapped to a track below. This is a **remediation** plan over existing screens, not a
greenfield screen build.

- **Cause 1 — font never wired globally.** `app/layout.tsx` still imports Geist + ships
  `metadata.title:"Create Next App"`; `globals.css` sets `--font-sans → geist` and body
  `font-family: Arial`. Montserrat (the real brand font) is only applied per-page, so any text
  not using the `font-montserrat` utility falls back to Arial. → **P1**.
- **Cause 2 — avatar/gallery images.** A prior session wrongly recorded "no photo assets exist"
  (`plans/260706-2200-sun-kudos-live-board/clarifications.md:74-80`). Real fills DO exist; the
  single-node MoMorph export just 401/500s. Real photos are already in place via crops; this
  phase formalizes the reversal, corrects the record, attempts one higher-fidelity export path,
  and hardens fallback. → **P2**.
- **Cause 3 — layout drift verified by eyeballing, not measuring.** The 260707-0243 plan fixed
  Kudos compose (F007) + Secret Box (F006) using real `getComputedStyle`/`getBoundingClientRect`
  vs MoMorph `get_node`. Extend that same method to the WHOLE site. → **P3–P6**.

## MoMorph Two-Track Shape (per `.claude/rules/momorph/momorph-development.md`)

- **Track B (global logic/data foundation):** P1 (font), P2 (images) + the shared measurement
  method (`references/measurement-method.md`).
- **Track A (per-screen UI conformance):** P3 (homepage), P4 (awards), P5 (site chrome),
  P6 (remaining kudos).
- **No `blocks`/`blockedBy` between Track A and Track B** — every P1–P6 phase is parallel-runnable
  (disjoint file ownership, verified below). Final cross-screen re-verification (with font + images
  active) is the single integration gate, **P7**.

## Phases

| # | Phase | Track | Status | Effort | Depends on | Parallel-safe with |
|---|-------|-------|--------|--------|-----------|--------------------|
| 1 | [Brand font wiring](phase-01-brand-font-wiring.md) | B | completed | 1.5h | — | 2,3,4,5,6 |
| 2 | [Real avatar & gallery images](phase-02-real-avatar-gallery-images.md) | B | completed | 2h | — | 1,3,4,5,6 |
| 3 | [Homepage pixel conformance (F002)](phase-03-homepage-pixel-conformance.md) | A | completed | 4h | — | 1,2,4,5,6 |
| 4 | [Awards pixel conformance (F004)](phase-04-awards-pixel-conformance.md) | A | completed | 3h | — | 1,2,3,5,6 |
| 5 | [Site chrome pixel conformance](phase-05-site-chrome-pixel-conformance.md) | A | completed | 2h | — | 1,2,3,4,6 |
| 6 | [Remaining Kudos pixel conformance](phase-06-kudos-components-pixel-conformance.md) | A | completed | 4h | — | 1,2,3,4,5 |
| 7 | [Integration & full-site DoD](phase-07-integration-and-dod.md) | — | completed | 2h | 1,2,3,4,5,6 | — |

## Dependency Graph

```
P1 (font) ─┐
P2 (imgs) ─┤
P3 (home) ─┤   all six parallel-runnable (disjoint file ownership)
P4 (awrd) ─┼──────────────► P7 (integration + full-site DoD)
P5 (chrm) ─┤
P6 (kudos)─┘
```

Execution waves for the forge:
- **Wave 1:** P1 ∥ P2 ∥ P3 ∥ P4 ∥ P5 ∥ P6 — none touch each other's files.
- **Wave 2:** P7 after all six are green.

**Why Track A audits don't hard-block on P1 (font).** Box-model conformance (padding, margin, gap,
border, radius, color, size) is font-independent — ~90% of the audit is valid regardless of which
font is active. Only text-flow-driven heights shift with the font. P7 re-verifies those flow-driven
measurements once Montserrat is globally active, so parallel execution is safe and momorph-compliant.

## Key Architectural Decisions

1. **Global font default, no per-page rip-out (KISS/YAGNI, ownership-safe).** P1 applies Montserrat
   at the `<html>` root in `layout.tsx` and points `--font-sans → --font-montserrat` in
   `globals.css`, so *default* (non-`font-montserrat`) text becomes Montserrat everywhere. The
   existing per-page `.variable` applications (`app/page.tsx`, `app/awards/page.tsx`,
   `app/kudos/page.tsx`) are left untouched — harmless (same var) and editing them would collide
   with P3/P4/P6 ownership. Root import via a neutral `app/fonts.ts` + a re-export shim from
   `app/login/fonts.ts` so no page file needs editing.
2. **Images are largely done — this phase formalizes, not rebuilds.** Real cropped photos already
   ship. P2's real work: correct the stale `clarifications.md`, one untested higher-fidelity export
   attempt (`get_node` embedded `background:url(...)`), keep the proven crop fallback otherwise,
   and guarantee fallback-to-initials is per-missing-image only (never the default).
3. **Reuse the 260707-0243 measurement method, don't reinvent it (DRY).** `references/
   measurement-method.md` captures the getComputedStyle/getBoundingClientRect-vs-`get_node`
   protocol once; every Track A phase consumes it. No screenshot eyeballing.
4. **Site chrome carved into its own phase (P5).** `site-header`/`site-footer` + their children
   (`nav-link`, `account-menu-button`, `notification-bell`) render on home, awards, AND kudos. One
   owner prevents three audit phases from editing the same files. P3/P4/P6 *render* chrome but never
   edit those files.
5. **Already-conformant components are verify-only.** Kudos compose (F007), Secret Box (F006), and
   `kudos-card`/`kudos-image-gallery` (researcher-260707-0110) were measured already. P6 re-verifies
   them under the global font but edits only on confirmed drift.

## File Ownership Map (no two parallel phases share a file)

| Phase | Owns (edits) |
|-------|--------------|
| P1 | `app/layout.tsx`, `app/globals.css`, `app/fonts.ts` (new), `app/login/fonts.ts` (→ re-export shim) |
| P2 | `app/components/kudos/avatar.tsx`, `app/components/kudos/kudos-image-gallery.tsx`, `public/kudos/**`, `plans/260706-2200-sun-kudos-live-board/clarifications.md` |
| P3 | `app/page.tsx`, `app/components/home/**` **except** chrome files (see P5) |
| P4 | `app/awards/page.tsx`, `app/components/awards/**` |
| P5 | `app/components/home/site-header.tsx`, `site-footer.tsx`, `nav-link.tsx`, `account-menu-button.tsx`, `notification-bell.tsx` |
| P6 | `app/kudos/page.tsx`, `app/components/kudos/**` **except** `compose/**`, `open-gift-button.tsx`, `avatar.tsx`, `kudos-image-gallery.tsx` |

## Global Constraints

- No new npm dependencies. Files < 200 lines (split otherwise). YAGNI / KISS / DRY, kebab-case.
- Every existing Vitest+RTL test stays green; add tests for new font/image/measured behavior.
- Verify pixels by real `getComputedStyle`/`getBoundingClientRect` vs MoMorph `get_node` — **never**
  by eyeballing thumbnails (P7 gate).
- Follow `docs/` code standards and `.claude/rules/momorph/momorph-development.md`.

## MoMorph refs

- fileKey: `9ypp4enmFmdK3YAFJLIu6C`
- Homepage: `i87tDx10uM` · Awards: `zFYDgyj_pD` · Secret Box: `J3-4YFIpMM`
- Kudos live board / spotlight: enumerate via `mcp__momorph__list_frames` / `get_project_overview`.
- Clarifications corrected: `plans/260706-2200-sun-kudos-live-board/clarifications.md:74-80`
</content>
</invoke>
