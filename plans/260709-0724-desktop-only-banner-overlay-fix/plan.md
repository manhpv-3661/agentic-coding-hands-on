---
title: "Desktop-only conversion + banner exact-size / text-overlay fix (login/home/awards/kudos)"
description: "Strip all responsive breakpoints to a single native desktop width per screen, rebuild each hero/keyvisual as an exactly-sized element with its title/text composited on top, and rewrite the layout-contract e2e suite to native-width-only + overlay containment."
status: done (P1-P5); P6 e2e rewrite deferred — tests intentionally not written this pass per user direction
priority: P1
effort: 17h
branch: main
work_type: fix
tags: [layout-system, momorph, desktop-only, banner, overlay, responsive-removal, playwright]
created: 2026-07-09
---

# Desktop-only conversion + banner exact-size / text-overlay fix

Three user-directed changes after a MoMorph-vs-live visual audit:

1. **Fix audit findings** — banners rendered via `bg-cover` approximation (not exact Figma
   box/crop) and hero text sitting in normal flow instead of composited on the banner.
2. **Remove ALL responsive behavior — desktop-only.** User verbatim: *"loại bỏ toàn bộ responsive
   nhé, cần mỗi màn desktop thôi."* Strip every Tailwind breakpoint variant (`sm:`/`md:`/`lg:`/
   `xl:`) from the layout primitives + all four screens and their components. Hardcode one native
   Figma desktop width per screen: **Login/Awards/Kudos = 1440**, **Home = 1512**. Gutter is a
   flat **144px always** (no breakpoint scaling); the per-screen content max-widths already exist
   (Login/Awards/Kudos 1152; Home tiered 1224/1152/1120).
3. **Banner = exact Figma pixel size + text overlaid ON TOP.** User verbatim: *"banner cũng phải
   chuẩn kích thước theo figma và text phải đè lên."* Each keyvisual becomes an explicitly-sized
   box (exact px), with the title/text block absolutely positioned over it in Figma paint order —
   not stacked below/beside it in flow.

Planning only — no implementation. Follows `.claude/rules/momorph/momorph-layout-system.md`
(numeric contracts from live source, single owner of gutter/max-width, numeric DOM verification
via Playwright — never eyeballing).

## Ground truth (live MoMorph MCP, treat as authoritative — do NOT re-fetch)

fileKey `9ypp4enmFmdK3YAFJLIu6C`. Numbers below are the audit's live-source measurements.

| Screen | screenId | Frame | Keyvisual box (x,y → w×h) | Text-overlay block (x,y → w×h) | Notes |
|---|---|---|---|---|---|
| Login | `GzbNeVGJHz` | 1440×1024 | image 1 `662:14389` 0,2 → **1441×1022**; crop `-440px -217.975px / 159.763% 133.371%` | logo 451×200 + subtitle 480×80 + Google btn 305×60 | bg currently `bg-cover` on outer div; text in flow inside `ContentFrame`. Header 1440×80 gutter 12/144. Footer gutter **90** (keep). |
| Awards | `zFYDgyj_pD` | 1440×6410 | image 20 `2167:5138` 0,80 → **1440×547**; crop pos `-0.163 -858.967`, scale `101.245% 367.889%` | "Bìa/KV" logo `144,184 → 1152×150` INSIDE the 547 band | Gold title "Hệ thống giải thưởng SAA 2025" at y≈519 lives BELOW the hero (its own 703px zone) — NOT overlaid. |
| Home | `i87tDx10uM` | 1512×4480 | photo `2167:9028` 1512×1392 + gradient `2167:9029` 1512×1480 (same origin, behind header+hero) | hero content in flow, backdrop absolute `-z-10` | Countdown tiles y=472, CTA y=735 — already composited over the `-z-10` backdrop. Work = fix native heights (drop responsive tiers). |
| Kudos | `MaZUn5xHXZ` | 1440×5862 | KV `2940:13432` 0,0 → **1440×512**; Cover gradient `0,445 → 1440×957` `linear-gradient(25deg,#00101A 14.74%,rgba(0,19,32,0) 47.8%)` on top | "A_KV Kudos" `144,184 → 1152×160` INSIDE 0–512 band (344<512) → title sits ON banner | Banner currently `bg-cover` w/ title+pills in flow. |

**Confirmed-correct, do NOT re-litigate:** gutter 144px, content max-widths 1152/1224/1120,
footer gutter 90px. These already pass `layout-contract.spec.ts` 18/18 on the current tree.

**Asset limitation (real):** Figma media export is auth-broken (401/500) for the Login + Kudos
keyvisual nodes. `public/login/hero-waves.jpg` + `public/kudos/hero-waves.jpg` are hand-crops of
the design's own frame render, so the literal Figma crop transform (`-440px -217.975px / …`) is
authored against the ORIGINAL asset and cannot be applied verbatim to the substitute. Login/Kudos
banner **box** can be sized exactly; the **crop math is a reconstruction** (say so, don't claim
pixel-perfect). Home/Awards use `public/homepage-saa/Keyvisual-BG.png` (a real asset) → box +
crop both achievable.

## Phases

| # | Phase | Status | Effort | Depends on | Parallel-safe with |
|---|-------|--------|--------|-----------|--------------------|
| 1 | [Primitives + shared shell → desktop-only](phase-01-desktop-primitives-shell.md) | pending | 3h | — | — |
| 2 | [Login banner overlay + responsive strip](phase-02-login-banner-overlay.md) | pending | 2h | 1 | 3,4,5 |
| 3 | [Awards banner overlay + responsive strip](phase-03-awards-banner-overlay.md) | pending | 3h | 1 | 2,4,5 |
| 4 | [Home keyvisual exact-size + responsive strip](phase-04-home-keyvisual.md) | pending | 3h | 1 | 2,3,5 |
| 5 | [Kudos banner overlay + responsive strip](phase-05-kudos-banner-overlay.md) | pending | 3h | 1 | 2,3,4 |
| 6 | [e2e layout-contract rewrite + DoD](phase-06-e2e-contract-rewrite.md) | pending | 3h | 2,3,4,5 | — |

## Dependency Graph

```
P1 (primitives+shell) ──► ┌─ P2 (login)  ─┐
                          ├─ P3 (awards) ─┤
                          ├─ P4 (home)   ─┼──► P6 (e2e rewrite + DoD)
                          └─ P5 (kudos)  ─┘
```

Waves: **1** P1 (serial gate) → **2** P2∥P3∥P4∥P5 (disjoint files) → **3** P6.

## Why banner-rebuild and responsive-strip are merged per screen (not two site-wide layers)

The task framed this as "P1: strip responsive from all screens; P2: rebuild all banners." Both
concerns touch the SAME screen files (`app/*/page.tsx`, the hero/banner components). Splitting by
layer would force every screen file to be shared between two phases → violates the "no two phases
touch the same file" ownership rule and serializes work that should parallelize. Instead each
screen phase (P2–P5) does BOTH its responsive strip AND its banner rebuild on its own disjoint
files. P1 is narrowed to the genuinely shared surface (primitives + site chrome), which is the
top-down gate `momorph-layout-system.md §6` requires anyway (fix primitives before screens).

## Key Architectural Decisions

1. **Gutter becomes flat 144px.** `PageGutter` class `w-full px-6 sm:px-10 lg:px-36` →
   `w-full px-36`. Content max-width caps (`ContentFrame`) unchanged. This is the "gutter 144px
   always, no breakpoint scaling" the user asked for; the single-owner architecture is preserved
   (KISS/DRY — one edit, not a rewrite). See Open Question #1 for the fixed-canvas alternative.
2. **Desktop-only = strip breakpoints, keep `w-full`.** Pages still fill the viewport ≥ native
   width and cap content at their max-width; below native width they simply do not reflow (no
   mobile/tablet layout). We are NOT introducing a fixed `w-[1440px]` canvas with horizontal
   scroll (rejected default — see Open Q #1).
3. **Banner = sized box + absolute overlay.** Each keyvisual is an explicitly-sized element
   (exact px per ground-truth table); the title/logo block is `position:absolute` over it at the
   Figma x/y, z-ordered per paint order (image → gradient → text). Awards' gold heading stays in
   flow BELOW the hero (design places it in its own zone — do not overlay it).
4. **Numbers from live MoMorph only.** Box sizes/crops come from the ground-truth table above,
   not memory. Login/Kudos crop transforms are explicitly labeled reconstructions (asset auth).
5. **No new deps, no "enhanced" copies, files <200 lines, kebab-case.** Edit in place.

## File Ownership Map (no two PARALLEL phases share a file)

| Phase | Owns (edits) |
|-------|--------------|
| P1 | `app/components/layout/page-layout.tsx`, `app/components/home/site-header.tsx`, `app/components/home/site-footer.tsx`, `app/components/home/nav-link.tsx`, `app/prelaunch/page.tsx`, `app/prelaunch/components/{prelaunch-content,countdown-led-unit}.tsx` |
| P2 | `app/login/page.tsx`, `app/login/components/login-hero-content.tsx` |
| P3 | `app/awards/page.tsx`, `app/components/awards/{awards-hero,awards-catalog,awards-nav-menu,award-detail-card}.tsx` |
| P4 | `app/page.tsx`, `app/components/home/{hero-section,countdown-timer,event-info,hero-cta-buttons,awards-section,root-further-content,sun-kudos-section}.tsx` |
| P5 | `app/kudos/page.tsx`, `app/components/kudos/{kudos-banner,kudos-board,kudos-sidebar,highlight-kudos-carousel}.tsx`, `app/components/kudos/compose/anonymous-toggle.tsx` |
| P6 | `e2e/layout-contract.spec.ts`, `e2e/layout-contract-helpers.ts` |

Note: `sun-kudos-section.tsx` is rendered by BOTH awards and kudos pages but is a home component →
owned solely by **P4**. P3/P5 render it, never edit it. Site header/footer owned solely by P1.

## Compatibility / Migration

- **Data:** none — pure presentational.
- **Users:** BREAKING product/UX change — mobile/tablet browsers lose responsive reflow; below
  native width content no longer adapts. User explicitly directed this. Flagged as top risk.
- **Integrations:** i18n (F005) untouched; auth/routing untouched.
- **Tests:** `app/components/layout/page-layout.test.tsx` asserts `px-6`/`sm:px-10`/`lg:px-36`
  (lines 11-13) → WILL FAIL after P1. Component tests referencing stripped `sm:`/`lg:` classes
  (kudos-banner, awards-hero, board tests, etc.) may fail. Per the user's standing "defer tests"
  preference, unit-test reconciliation is a **deferred follow-up pass**, NOT per-phase work — but
  this means `npm test` is not green until that pass. DoD reflects this explicitly.
- **Other e2e:** `e2e/homepage-content.spec.ts` + `e2e/login.spec.ts` set viewports; audit for
  sub-native assertions is a P6 follow-up note (task scopes P6 to `layout-contract` only).

## Risk Assessment (High-impact first)

| Risk | Likelihood | Impact | Countermove |
|------|-----------|--------|-------------|
| Removing responsive is a real product decision (mobile/tablet users lose reflow) | Confirmed (user-directed) | High | Explicit confirmation gate below; ship behind the user's stated intent, document as breaking in changelog |
| Changing shared `PageGutter` (px-36 flat) regresses ALL screens at once | High | High | P1 is one atomic gated phase; P6 numeric test catches regression; screens don't start until P1 green |
| Login/Kudos crop math can't match Figma (asset auth broken) | Confirmed | Med | Size the box exactly; label crop a reconstruction; log clean-export follow-up (Open Q #2) |
| Absolute overlay breaks vertical centering / clips text at native width | Med | Med | Overlay uses Figma x/y within the sized band; P6 asserts title rect ⊆ banner rect |
| `page-layout.test.tsx` + component tests fail on stripped classes | High | Med | Deferred unit-test pass (user pref); DoD gates on e2e + lint + build, not `npm test` |
| Prelaunch (F003) shares `PageGutter`; native width unconfirmed | Med | Low | P1 strips its responsive too; width flagged Open Q #3 (default 1440) |
| Home countdown/CTA anchored by y-offset may drift when heights hardcode | Low | Med | Home content already composites over `-z-10` backdrop; only backdrop heights change |

## Rollback

Each phase = one discrete commit. Reverse-dependency revert: P6 → (P5/P4/P3/P2 any order) → P1.
Reverting P1 alone while screens remain is unsafe (screens consume the flat-gutter primitive) →
roll back screen phases first if P1 is reverted. Substitute banner assets are already in git.

## Definition of Done (observable)

- Zero `sm:`/`md:`/`lg:`/`xl:` variants remain in the primitives + all four screens + their owned
  components (grep audit clean; prelaunch included).
- `PageGutter` gutter is a flat 144px; each screen renders at its native width with correct caps.
- Each keyvisual is an exactly-sized box (Login 1441×1022, Awards 1440×547, Home 1512×1392+1480,
  Kudos 1440×512) with its title/text block `position:absolute` over it (Awards heading excepted).
- `npm run e2e -- layout-contract` passes: native-width numeric contract per screen + new
  banner-size and title-rect-⊆-banner-rect assertions.
- `npm run lint` + `npm run build` (typecheck) green.
- Deferred (tracked, NOT gating this plan per user pref): Vitest unit-test reconciliation.

## Open Questions / Decisions Needed (defaults chosen, not blocking)

1. **Desktop-only mechanism.** Default: strip breakpoints, keep `w-full` + flat 144px gutter +
   existing max-width caps (content shrinks, doesn't reflow, below native). Alternative: hard
   `w-[1440px]`/`w-[1512px]` centered canvas with horizontal scroll below native. Confirm which.
2. **Figma media auth (401/500)** blocks clean Login/Kudos keyvisual export → those two banners
   keep substitute crops sized to the exact box but reconstructed crop transform. Restore Figma
   credentials to swap in pixel-exact sources (follow-up).
3. **Prelaunch (F003) native width** not in the audit's 4 screens. Default: strip its responsive,
   treat as 1440-native. Confirm if prelaunch has its own design width.
4. **Kudos Spotlight name count** — audit found 106 live DOM name-spans vs ~352 in design
   (88 names × 4 repeats). This is a DATA-LAYER question, NOT a layout defect. Do NOT fabricate
   duplicate names to hit 352. Confirm whether the source name list should be expanded/repeated.

## MoMorph refs
- fileKey: `9ypp4enmFmdK3YAFJLIu6C`
- Login `GzbNeVGJHz` · Home `i87tDx10uM` · Awards `zFYDgyj_pD` · Kudos `MaZUn5xHXZ`
- Prior layout plan (format/precedent): `plans/260707-2337-site-layout-system-audit-fixes/`
