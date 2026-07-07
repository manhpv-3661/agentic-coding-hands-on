# Full-Site Audit — Summary & Final Gate Verification (2026-07-07)

## Final gate numbers (this session, verified live — not trusted from prior self-reports)

| Gate | Command | Result |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | **0 errors** |
| Lint | `npx eslint app` | **0 errors**, 5 pre-existing `@next/next/no-img-element` warnings (intentional — static-icon `<img>` tags kept off `next/image` to preserve exact pixel render; unchanged by this audit) |
| Tests | `npx vitest run` (whole repo) | **500/500 tests passed, 80/80 files passed** |

Two regressions were found and fixed during this verification pass (see "Regressions fixed this
session" below) before the suite reached the numbers above.

---

## Audit scope: 9 screens

1. Login (F001)
2. Homepage (F002)
3. Countdown / Prelaunch gate (F003)
4. Awards Information (F004)
5. i18n / VI-EN localization (F005, cross-cutting)
6. Site chrome — Header/Footer (shared across `/`, `/awards`, `/kudos`)
7. Kudos Live Board (F006)
8. Kudos Compose — "Viết Kudos" (F007)
9. Kudos Like Toggle (F008)

---

## Round-by-round history (4 rounds to first dry round)

**Round 1 — `reviewer-260707-0110-full-app-review.md`.** Full-app adversarial sweep. Found 2
Critical, 1 High, 3 Medium, 2 Low findings (compose double-submit, anonymous self-like, hardcoded
`lang="vi"`, nickname-collision block, hardcoded insert-link prompt, false-success copy button,
non-localized aria-label). Not dry — 8 new findings.

**Round 2 — `reviewer-260707-0202-full-app-verification-and-fixes.md`.** Fixed all of Round 1's
findings and, on independent re-verification, found and fixed 5 more (React key warning on
`/kudos`, header nav active-state hardcoded to "/", footer nav active-state hardcoded to
"/awards", awards left-nav missing active state, awards cards not alternating image side) plus
a full Kudos card re-theme (dark custom theme → cream ground truth). Not dry — 12 new
found-and-fixed defects total this round.

**Round 3 — site-visual-fidelity-fixes P1–P7 (font wiring, avatar/gallery images, per-screen
pixel audits, final integration pass `implementer-260707-0924-p7-integration-and-dod.md`).**
Wired global Montserrat + self-hosted Digital Numbers countdown font, formalized real
avatar/gallery photos, closed a double-applied 144px gutter and mis-centered title on Awards,
fixed footer nav-link border-radius. The independent P7 second pass caught **2 more** Δs P4 had
missed (awards-catalog two-column gap: 80px assumed vs 121px actual; awards-hero cover-gradient
stop-percentage math error). Not dry — 2 new found-and-fixed defects this round.

**Round 4 — `reviewer-260707-0610-kudos-pixel-conformance.md`.** Independent inspection of the
Kudos compose cream restyle (FR-22), Community Standards panel (FR-23), insert-link dialog
(FR-24), and Secret Box count fix (FR-19-rev). **Critical: none. Zero new defects found** — only
pre-declared, already-accepted deferred cleanup items (dead dict keys, one open
measurement-confidence note). **First dry round** — 0 consecutive dry rounds reached, closing
the audit loop.

---

## Confirmed-and-fixed defects, grouped by screen

### 1. Login (F001)
No new defects found in this audit cycle. Re-verified clean in Round 1: both previously-flagged
issues (login screen `lang` attribute, `LoginButton` client-component boundary) were confirmed
already fixed by an earlier session.

### 2. Homepage (F002)
- **Font**: was falling back to Geist/Arial off the global default; wired to Montserrat site-wide
  (Round 3, P1). Hero countdown digits swapped from Orbitron to the ground-truth "Digital
  Numbers" font, self-hosted via `next/font/local`, verified pixel-exact (73.728px/49.152px)
  against MoMorph (Round 3, P1 + P7 re-verification).
- Pixel audit otherwise found **zero drift** — hero, countdown, event info, CTA buttons, awards
  grid, Sun Kudos section, floating widget all matched ground truth (Round 2, Round 3 P3).

### 3. Countdown / Prelaunch (F003)
- Same Digital Numbers font fix as Homepage applies to the Prelaunch countdown component
  (`countdown-led-unit.tsx`), verified pixel-exact (73.728px) against MoMorph (Round 3, P1/P7).

### 4. Awards (F004)
- Double-applied 144px gutter (`max-w` + `mx-auto` stacked on `lg:px-36`) shrinking content to
  864px instead of 1152px — fixed (Round 3, P4).
- Title/eyebrow block not centered — fixed (Round 3, P4).
- Nav menu font-weight/letter-spacing drift — fixed (Round 3, P4).
- Award-detail-card: background photo position, description weight/justification, icon-row gaps,
  content-group dividers, quantity/value typography split — fixed (Round 3, P4).
- Left-nav scroll-spy had no active state (design: gold + glow) — fixed with `useScrollSpy`
  (Round 2).
- Award cards did not alternate image left/right per design — fixed via `imageSide` prop,
  even/odd (Round 2).
- Footer nav-link hardcoded `highlighted` on `/awards` regardless of actual route — fixed with
  `usePathname()` (Round 2).
- `awards-catalog` two-column gap: code used naive `gap-20` (80px); ground truth's effective gap
  (given `justify-content: space-between` on two fixed-width children) is 121px — fixed (Round 3,
  P7 independent second pass, missed by P4).
- `awards-hero` cover-gradient stop percentages had a math error (didn't subtract the 80px sticky
  header offset before rescaling) — fixed, math documented in-code (Round 3, P7).

### 5. i18n / Localization (F005)
- `vi.ts` `images.label`/`images.add` left in English — fixed (Round 1→2).
- `images.truncated` dead dictionary key, never wired to the selection-cap UI — fixed (Round
  1→2).
- Root `<html lang="vi">` was hardcoded regardless of the active `NEXT_LOCALE` — fixed to
  `<html lang={await getLocale()}>` (Round 1→2).

### 6. Site Chrome — Header/Footer (shared)
- Header nav hardcoded `selected` state on "/" regardless of the actual route — fixed with
  `usePathname()` (Round 2).
- Footer `FooterNavLink` border-radius inherited the header's 4px instead of the design's 0px —
  fixed with `rounded-none` (Round 3, P5).
- Cross-page chrome parity (`/`, `/awards`, `/kudos` all render the identical `SiteHeader`/
  `SiteFooter`) confirmed structural, not per-page drift (Round 3, P7).

### 7. Kudos Live Board (F006)
- React `key` warning on the `/kudos` `KudosBoard`/`SpotlightBoard` slot — fixed (Round 2).
- Entire Kudos card was rendered in a self-invented dark theme (`#101317`) instead of the
  ground-truth cream theme — restyled in full: card background `#FFF8E1`, highlight border 4px
  `#FFEA9E` r16, feed r24, text `#00101A`, timestamp `#999999`, content box
  `rgba(255,234,158,.4)` — fixed (Round 2).
- Hashtags were rendered as a yellow pill instead of plain red (`#D4271D`) text — fixed (Round
  2).
- Heart icon didn't switch gray→red (`#D4271D`) on like — fixed (Round 2).
- Avatar missing the 64px white-border treatment; "danh hiệu" badge pills (Rising/Legend/New
  Hero), pencil icon, and content divider were all missing — fixed (Round 2).
- Gallery tile was not the ground-truth 88×88 white-framed size — fixed (Round 2).
- Hero was missing the "Tìm kiếm profile Sunner" search pill entirely — added, r68 border
  `#998C5F` (Round 2).
- Spotlight board was missing its r47 corner radius and the 6-line fade-out ticker — added
  (Round 2).
- Sidebar stats box: wrong border/radius (`#00070C` border `#998C5F` r17 required), number
  color/size (`#FFEA9E` 32/40), missing "x2" badge, Secret Box button not gold/r8/icon — fixed
  (Round 2).
- Gift-recipients box padding drift — fixed (Round 3, P6).
- Spotlight "388 KUDOS" counter was 24px gold; ground truth is 36px/44 white — fixed (Round 3,
  P6).
- Secret Box (FR-19-rev): count field read from a nonexistent `secretBoxesUnopened` field
  instead of the real `secretBoxUnopened` — fixed; plain-text "Đóng" button replaced with a
  ground-truth top-right `X` close button, wired through `useDismissableMenu` for Escape parity
  — fixed (Round 4, verified SEALED).

### 8. Kudos Compose — "Viết Kudos" (F007)
- No submit-guard: rapid double-click on Submit fired `handleSubmit` twice against the
  not-yet-reset state, and millisecond-resolution `Date.now()` ids could collide — fixed with an
  `isSubmittingRef` guard plus a monotonic id source; regression test added (2 rapid clicks → 1
  post) (Round 1→2).
- `window.prompt("URL")` was hardcoded and never localized despite a `linkPrompt` dictionary key
  existing unused — replaced with a real controlled `InsertLinkDialog` (2-field: content/URL,
  validates blank URL) driven off dictionary labels (Round 2, hardened further in Round 4/
  FR-24).
- `CopyLinkButton` set `copied = true` unconditionally even when `navigator.clipboard.writeText`
  failed, showing false "Link copied" success — fixed to only set `copied` on a successful write
  (Round 1→2).
- Compose dialog and all field sub-components (`field-group`, `hashtag-input`, `image-upload`,
  `anonymous-toggle`, `recipient-select`, `rich-text-editor`) restyled from the dark theme to the
  ground-truth cream theme (`bg-[#FFF8E1]`, `#00101A` text, `#998C5F` borders); error text moved
  from low-contrast `text-red-400` to `font-semibold text-[#CF1322]` across all 6 occurrences —
  fixed (Round 4, FR-22, verified SEALED).
- Community Standards panel was a dead, non-functional `<button>` — replaced with a real
  `useDismissableMenu`-driven dialog rendering all 4 Hero tiers, 6 collection icons, and the
  national section, each independently test-covered — fixed (Round 4, FR-23).

### 9. Kudos Like Toggle (F008)
- `canLikeKudos` had no way to detect true authorship once a post was submitted anonymously
  (anonymous compose replaces `sender` entirely), letting a user like their own anonymous Kudos
  and inflate their own heart count — fixed by tracking `sentByCurrentUser`/`anonymous` flags
  from `buildKudosPost` and checking true authorship first in `canLikeKudos` (Round 1→2).
- Same root-cause fix also closed the companion bug where a real Sunner's like was wrongly
  blocked if an anonymous nickname happened to collide with their display name (Round 1→2).

---

## Regressions fixed this session (found while re-running the final gate, not part of the 4
historical rounds above)

Both were pre-existing tests that the historical audit's own UI fixes (Round 3's Awards
title-casing correction, Round 4's Kudos-compose hashtag-field restyle) left un-synced with —
confirmed by `git diff` against the corresponding source files, then corrected the tests to match
the now-correct product behavior (not reverted):

1. **`tests/unit/awards-page.test.tsx`** — the audit's Round 3 fix corrected the Awards title
   section's eyebrow caption casing from `"Sun* annual awards 2025"` to the ground-truth
   `"Sun* Annual Awards 2025"` (`app/awards/page.tsx`), but the test still asserted the old
   lowercase string, and once fixed the string now matches `AwardsHero`'s (separately, correctly)
   capitalized subtitle verbatim, making a page-wide `getByText` ambiguous. Fixed by scoping the
   assertion to the title-section's own DOM subtree (`within(heading.parentElement)`) so it
   verifies the specific instance the test is actually about, rather than an ambiguous whole-page
   query.
2. **`tests/unit/kudos-compose.test.tsx`** (2 tests) — the audit's Round 4 FR-22 restyle changed
   `HashtagInput` from an always-visible text field to a closed "+Hashtag" pill trigger that must
   be clicked to reveal the input (ground-truth interaction). The pre-existing "valid submit" and
   "anonymous submit" tests typed into the hashtag placeholder directly without opening it first.
   Fixed by adding `user.click` on the "+Hashtag" trigger button before typing, matching the
   product's actual (and correct) interaction flow.

No production code was changed to fix these — both were test-side gaps against already-correct,
already-reviewed UI behavior.

---

## Known, accepted gaps (not defects — explicitly out of scope, unchanged this session)

- Awards quantity/value metadata: Figma splits number (36px) from unit/qualifier (14px) as two
  text nodes; current data model holds one combined string, approximated as one 24px size.
  Requires a data-model change, out of this audit's scope.
- Awards catalog: Figma authors two visually distinct card sub-layouts across 6 entries; this
  codebase intentionally uses one shared `AwardDetailCard` component per plan requirement, so
  full per-variant pixel-parity isn't simultaneously achievable.
- Three Kudos items are not verifiable through static analysis (would need a live browser
  render): Highlight carousel's gradient-fade mask blend, Spotlight name-cloud's algorithmic
  placement, and one sub-pixel search-pill scale artifact.
- Dead dictionary keys (`gift.dialogTitle/dialogBody/close`, `compose.content.toolbar.linkPrompt`)
  left in place per an explicit prior-phase decision, flagged for a future cleanup pass.
- FR-23 Community Standards panel theme (dark, not cream) is a self-reported live-measurement
  correction that Round 4's reviewer could not independently re-verify against MoMorph
  (no MCP access in that session) — reasoning is internally consistent and cites specific
  measured values; flagged as open for a future MoMorph spot-check, not refuted.

---

**Status:** DONE
**Summary:** Full suite verified green after fixing 2 test-only regressions (Awards title-caption
scoping, Kudos hashtag-field open-before-type) that surfaced because two of the historical audit's
own UI fixes were correct but left pre-existing tests unsynced. Final gate: `tsc` 0 errors,
`eslint app` 0 errors / 5 pre-existing warnings, `vitest run` 500/500 tests across 80/80 files.
**Concerns/Blockers:** None. Known accepted gaps above are pre-declared, scope-bounded items, not
open defects.
