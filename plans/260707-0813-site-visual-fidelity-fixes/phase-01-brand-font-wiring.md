---
phase: 1
title: "Brand font wiring (global Montserrat)"
track: B
status: pending
priority: P1
effort: 1.5h
depends_on: []
parallel_safe_with: [2, 3, 4, 5, 6]
file_ownership:
  - app/layout.tsx
  - app/globals.css
  - app/fonts.ts                                  # NEW — canonical brand-font module
  - app/login/fonts.ts                            # → becomes a re-export shim (no page edits needed)
  - app/layout.test.tsx                           # if present; else add
  - app/components/home/countdown-timer.tsx       # Orbitron → Digital Numbers
  - app/components/home/countdown-timer.test.tsx
  - app/prelaunch/components/countdown-led-unit.tsx   # Orbitron → Digital Numbers
  - app/prelaunch/components/prelaunch-content.test.tsx
  - app/page.test.tsx
  - app/components/home/hero-section.test.tsx
---

# Phase 1 — Brand Font Wiring

## Context Links

- Research: font-extraction report (this session) — Montserrat is the confirmed site-wide brand
  font; Montserrat Alternates is a bold accent.
- **User-confirmed against live MoMorph (`query_by_type TEXT`, screenId `8PJQswPZmU`, this session):**
  countdown digit nodes (e.g. `I2268:35141;186:2617`) declare `fontFamily: "Digital Numbers"`,
  `fontWeight: 400`, `fontSize: ~73.7px`. DAYS/HOURS/MINUTES labels + heading declare `Montserrat`
  `700`/`36px`. **Orbitron (current code in `countdown-timer.tsx` / `countdown-led-unit.tsx`) is
  confirmed WRONG — a guess from a prior session, not what the design specifies.** User directive:
  "làm theo design, những thứ không theo design đều là sai" — swap to the real font, no exceptions.
- `Digital Numbers` IS on Google Fonts (`google/fonts` ofl/digitalnumbers, SIL OFL 1.1) and is
  importable via `next/font/google` as `Digital_Numbers` — no local font hosting needed, no new
  dependency, no license risk.
- Current defaults: `app/layout.tsx:2` imports `Geist, Geist_Mono`; `metadata.title:"Create Next App"`;
  `app/globals.css:11-12` map `--font-sans → geist`; `globals.css:29` body `font-family: Arial`.
- Existing font config: `app/login/fonts.ts` (Montserrat 400/500/600/700 + Alternates 400/700).

## Overview

- **Priority:** P1 — the single most visible defect (wrong typeface site-wide).
- Wire Montserrat as the global default font so *every* text node (not just `font-montserrat`
  utility users) renders Montserrat. Kill the `create-next-app` Geist defaults and boilerplate
  metadata. Also replace Orbitron with the design-confirmed `Digital Numbers` font on the countdown
  digits (both the homepage countdown and the `/prelaunch` LED unit — same component family, same
  wrong font, same fix). Font is a Track B foundation — parallel-safe with all audits.

## Key Insights

- Montserrat is ALREADY configured and applied per-page; the gap is purely the **root layout** and
  **globals.css defaults** still pointing at Geist/Arial. Do NOT re-discover or re-add the font.
- `--font-sans` currently resolves to `--font-geist-sans`. Repointing it to `--font-montserrat`
  fixes default body text app-wide in one line.
- Do NOT rip out the per-page `.variable` applications in `app/page.tsx` / `app/awards/page.tsx` /
  `app/kudos/page.tsx` — they set the same var (harmless) and are owned by P3/P4/P6. Editing them
  would break the disjoint-ownership guarantee.
- **Countdown digits are now IN SCOPE (reversal of the original plan).** Both
  `app/components/home/countdown-timer.tsx` (homepage) and
  `app/prelaunch/components/countdown-led-unit.tsx` (prelaunch gate) currently hard-code Orbitron —
  grep confirms both, plus 4 test files asserting the Orbitron class/font. Swap both components to
  `Digital_Numbers` from `next/font/google`; update the 4 dependent test files' font assertions
  (`app/page.test.tsx`, `hero-section.test.tsx`, `countdown-timer.test.tsx`,
  `prelaunch-content.test.tsx`) to expect Digital Numbers instead of Orbitron. Digit font size/weight
  per MoMorph: `73.7px`/`400` — verify against current CSS, adjust if it diverges (P7 re-measures).
- **Vietnamese subset confirmed needed (user decision, this session).** Add `"vietnamese"` to the
  Montserrat Alternates subset list — the login footer renders VN copy in that face and the site is
  bilingual (VI/EN), so the glyph coverage gap is real, not speculative. No longer conditional/YAGNI.

## Requirements

- **FR-F1:** `<html>` in `layout.tsx` carries `montserrat.variable` + `montserratAlternates.variable`
  (drop the two Geist variables).
- **FR-F2:** `globals.css` — `--font-sans: var(--font-montserrat)`; `--font-mono` kept or removed
  if unused (grep first); body `font-family` fallback stack → `var(--font-montserrat), system-ui,
  sans-serif` (no more Arial).
- **FR-F3:** `metadata` — real title/description (e.g. title `"Sun* Annual Awards 2025"`,
  description from the shared dictionary if one exists, else a plain brand string). No
  "Create Next App".
- **FR-F4:** Geist imports removed from `layout.tsx`; no dangling `--font-geist-*` references.
- **FR-F5:** `app/components/home/countdown-timer.tsx` and
  `app/prelaunch/components/countdown-led-unit.tsx` use `Digital_Numbers` from `next/font/google`
  (weight `400`) instead of Orbitron, on every countdown digit. No visual/behavior change to the
  DAYS/HOURS/MINUTES labels (Montserrat, already correct).
- **FR-F6:** `app/fonts.ts`'s Montserrat Alternates config includes `"vietnamese"` in `subsets`.

## Architecture

- **New `app/fonts.ts`** — canonical module exporting `montserrat`, `montserratAlternates`,
  `digitalNumbers` (move the Montserrat bodies from `app/login/fonts.ts`; add `digitalNumbers` new).
  `app/login/fonts.ts` becomes
  `export { montserrat, montserratAlternates } from "@/app/fonts";` so `page.tsx`/`awards/page.tsx`/
  `kudos/page.tsx` keep importing from their current path unchanged (zero page edits, DRY).
- `layout.tsx` imports from `@/app/fonts`, applies both `.variable` classes on `<html>` alongside
  the existing `h-full antialiased`.
- Data flow: `next/font/google` → CSS vars on `<html>` → `--font-sans` (globals) → every element's
  default `font-family`. Utility `font-montserrat` continues to resolve to the same var.
- `countdown-timer.tsx` / `countdown-led-unit.tsx` import `digitalNumbers` from `@/app/fonts`
  directly (not through `--font-sans`) and apply `digitalNumbers.className`/`.variable` to the digit
  elements only — labels keep their existing Montserrat class untouched.

## Related Code Files

- **Modify:** `app/layout.tsx`, `app/globals.css`, `app/login/fonts.ts` (→ shim),
  `app/components/home/countdown-timer.tsx`, `app/prelaunch/components/countdown-led-unit.tsx`,
  `app/page.test.tsx`, `app/components/home/hero-section.test.tsx`,
  `app/components/home/countdown-timer.test.tsx`, `app/prelaunch/components/prelaunch-content.test.tsx`
- **Create:** `app/fonts.ts`, `app/layout.test.tsx` (if none)
- **Read for context:** `app/page.tsx`, MoMorph `query_by_type TEXT` result for screenId
  `8PJQswPZmU` (font-family ground truth for digits/labels)
- **Delete:** none

## Implementation Steps

1. Create `app/fonts.ts` exporting `montserrat`, `montserratAlternates` (moved from `login/fonts.ts`,
   Alternates subsets now include `"vietnamese"`) and new `digitalNumbers = Digital_Numbers({
   subsets: ["latin"], weight: "400", variable: "--font-digital-numbers" })`.
2. Replace `app/login/fonts.ts` body with a re-export from `@/app/fonts`.
3. `app/layout.tsx`: remove Geist imports; import from `@/app/fonts`; apply both Montserrat
   `.variable` on `<html>`; replace `metadata` title/description with real values.
4. `app/globals.css`: `--font-sans → var(--font-montserrat)`; fix body `font-family` fallback;
   grep for `--font-geist`/`--font-mono` usage before removing; update the stale "scoped to /login"
   comment.
5. `countdown-timer.tsx` + `countdown-led-unit.tsx`: swap Orbitron import/class for `digitalNumbers`
   on the digit glyphs only; verify computed `fontSize`/`fontWeight` against the MoMorph values above.
6. Update the 4 dependent test files' font-class/font-family assertions from Orbitron to Digital
   Numbers.
7. `npx tsc --noEmit` + `npx eslint app` + `npx vitest run` (whole repo — countdown tests span 4 files).

## Todo List

- [ ] `app/fonts.ts` created (Montserrat + Alternates w/ vietnamese subset + digitalNumbers);
      `login/fonts.ts` re-exports
- [ ] `layout.tsx` applies Montserrat vars, Geist removed, real metadata
- [ ] `globals.css` `--font-sans` + body fallback + comment fixed
- [ ] `countdown-timer.tsx` + `countdown-led-unit.tsx` use Digital Numbers, not Orbitron
- [ ] 4 dependent test files updated to assert Digital Numbers
- [ ] no dangling `--font-geist-*`/Orbitron references
- [ ] tsc + eslint + tests green

## Success Criteria

- In-browser: `getComputedStyle(document.body).fontFamily` reports Montserrat first (not Arial).
- In-browser: `getComputedStyle` on a countdown digit reports Digital Numbers, not Orbitron.
- Browser tab title is the real brand title, not "Create Next App".
- Every existing test stays green (post-update); a test asserts the root layout applies the
  Montserrat variable and metadata title, and that countdown digits use Digital Numbers.
- Default (non-`font-montserrat`) text visibly renders Montserrat on a page that has such text.
- Montserrat Alternates `subsets` includes `"vietnamese"`.

## Risk Assessment

| Risk | Likelihood | Impact | Countermove |
|------|-----------|--------|-------------|
| Removing `--font-mono`/`--font-geist` breaks a hidden consumer | Med | Med | Grep repo before deletion; keep the var if referenced |
| Global default font shifts text-flow heights, moving Track A measurements | High | Low | Expected — P7 re-verifies flow-driven heights with font active |
| Re-export shim confuses import resolution | Low | Low | Keep named exports identical; tsc catches breakage |
| Digital Numbers glyph metrics differ from Orbitron enough to shift LED-unit layout | Med | Low | Re-measure digit box width/height against MoMorph after swap; adjust container CSS if needed |

## Security Considerations

None — presentational/config only. No new input surface, no auth/route change.

## Next Steps

Unblocks nothing hard (parallel-safe). P7 re-verifies flow-driven measurements once the global font
is active. Optional follow-up (out of scope): rename fully off `app/login/fonts.ts`, VN subset audit.
</content>
