# Phase 01 — i18n hardcode gaps

## Context Links
- Audit: `plans/reports/audit-260709-1522-kudos-i18n-and-features.md` → "Vấn đề 1 — i18n hardcode"
- i18n exception rules: `plans/260706-2016-i18n-vi-en-translation/clarifications.md` (only brand names, award-category names, and the exact "Sun* Annual Awards 2025" caption are exempt — English section headings are NOT)
- Dictionaries: `lib/i18n/dictionaries/en.ts`, `lib/i18n/dictionaries/vi.ts` (`satisfies Dictionary` parity guard)

## Overview
- Priority: P2
- Status: pending
- Move hardcoded UI strings (section headings + aria-labels) into the dictionary and wire them. Correct the false "clarifications.md exception" doc-comment in `kudos-section-heading.tsx`.

## Key Insights
- The working tree has a botched title-move: `kudos-section-heading.tsx` currently accepts `title` but does NOT render it (the `<h2>` was removed), while `highlight-kudos-carousel.tsx:68-70` has a standalone `<h2>HIGHLIGHT KUDOS</h2>`. Net current bug: ALL KUDOS / SPOTLIGHT BOARD titles don't render at all; HIGHLIGHT KUDOS renders via the stray h2. HEAD had the `<h2>{title}</h2>` inside the shared component (correct). **End state: restore the `<h2>{title}</h2>` in `KudosSectionHeading`, delete the stray h2 in the carousel, all three callers pass a dictionary-driven title.**
- `satisfies Dictionary` means every key must land in BOTH `en.ts` and `vi.ts`, correctly nested, or `tsc --noEmit` fails.
- Some aria-labels appear TWICE in a file (notification-bell 67+76, account-menu 56+65, widget-button 153+178) — one on the trigger button, one on the popup container. Reuse one key per concept where the text is identical; the audit lists account-menu as "Account menu" + "Account" (two distinct strings) — keep them distinct.
- `site-header.tsx:61` / `site-footer.tsx:94` aria-label is `"Sun* Annual Awards 2025 — home"`. The brand+year part is an exception (stays as-is); only the "— home" link-purpose suffix moves to the dictionary. Compose at render as `${brandCaption} — ${dict.homeSuffix}` (or a full templated key that embeds the brand literal). Keep the brand literal out of the dictionary.

## Requirements
Functional:
- Section headings "ALL KUDOS", "HIGHLIGHT KUDOS", "SPOTLIGHT BOARD" come from the dictionary (VI translated).
- The stray duplicate `<h2>` in the carousel is deleted; title renders exactly once per section.
- Every aria-label in the gap table is dictionary-driven, VI translated.
- `site-header`/`site-footer` logo aria-label keeps the brand literal, moves only "— home".

Non-functional:
- `tsc --noEmit` and lint clean.
- VI translations idiomatic; headings may stay uppercase per design (VI equivalent, e.g. "TẤT CẢ KUDOS" / "KUDOS NỔI BẬT" / "BẢNG SPOTLIGHT") — confirm casing/wording in Unresolved.

## Architecture / Data flow
Dictionary (`en.ts`/`vi.ts`) → `getDictionary(locale)` (existing loader) → server component passes `dict.kudos.sections.*` / `dict.shared.a11y.*` down as label props → presentational components render them. No new data source; no new loader.

Proposed key placement:
- `kudos.sections`: `{ allKudos, highlightKudos, spotlightBoard }` (new object under existing `kudos`).
- `shared.a11y`: `{ awardCategories, notifications, accountMenu, account, quickActions, mentionSuggestions, logoHomeSuffix, carouselPrevSlide, carouselNextSlide, carouselPrev, carouselNext }` (new object under `shared`). Group carousel labels under `kudos.highlight.a11y` instead if cleaner — decide during impl, keep it one consistent place.

## Related Code Files
Modify:
- `lib/i18n/dictionaries/en.ts` — add `kudos.sections.*` + `shared.a11y.*` keys
- `lib/i18n/dictionaries/vi.ts` — same keys, VI values
- `app/components/kudos/kudos-section-heading.tsx` — restore `<h2>{title}</h2>`; fix the doc-comment (remove the false "brand/English design labels stay out of the dictionary per clarifications.md" claim for the title)
- `app/components/kudos/kudos-board.tsx:96` — pass `title={dict.kudos.sections.allKudos}`
- `app/components/kudos/highlight-kudos-carousel.tsx` — pass `title={...highlightKudos}`, DELETE stray `<h2>` (lines 68-70), thread aria-label labels (Previous/Next slide, Previous, Next) via props or a labels object
- `app/components/kudos/spotlight-board.tsx:52` — pass `title={...spotlightBoard}` (coordinate with Phase 02, which rewrites this file — see ownership note)
- `app/components/awards/awards-nav-menu.tsx:58`
- `app/components/home/notification-bell.tsx:67,76`
- `app/components/home/account-menu-button.tsx:56,65`
- `app/components/home/widget-button.tsx:153,178`
- `app/components/kudos/compose/mention-suggestions.tsx:48`
- `app/components/home/site-header.tsx:61`, `app/components/home/site-footer.tsx:94`

Trace each component's parent to confirm it already receives the dictionary/locale; if a leaf component (e.g. `mention-suggestions`, carousel) doesn't get `dict`, thread a minimal `labels`/`aria` prop from the nearest dictionary-aware ancestor rather than importing the dictionary into a client leaf.

## Implementation Steps
1. Read how each target component currently receives strings (props vs direct dict import). Map the shortest prop path for each aria-label.
2. Add `kudos.sections` + the a11y keys to `en.ts`; mirror in `vi.ts`. Run `tsc --noEmit` to confirm parity guard passes.
3. Restore `<h2 className="...">{title}</h2>` in `kudos-section-heading.tsx`; rewrite the doc-comment to state the title is now dictionary-driven (not an exception).
4. Delete the stray `<h2>` block in `highlight-kudos-carousel.tsx` (lines ~68-70); keep the single `KudosSectionHeading`.
5. Wire `title` prop at all three callers (board, carousel, spotlight) from the dictionary.
6. Wire each aria-label from the dictionary; for the logo, compose `"<brand> — <homeSuffix>"` keeping the brand literal in code.
7. `tsc --noEmit` + lint. Visual check at 1440: each section title shows once.

## Todo List
- [ ] Add `kudos.sections` + `shared.a11y` keys to `en.ts`
- [ ] Mirror keys in `vi.ts` (VI values)
- [ ] Restore `<h2>{title}</h2>` in `kudos-section-heading.tsx` + fix doc-comment
- [ ] Delete stray `<h2>` in `highlight-kudos-carousel.tsx`
- [ ] Wire `title` at board / carousel / spotlight callers
- [ ] Wire carousel Previous/Next aria-labels
- [ ] Wire awards-nav-menu, notification-bell, account-menu-button, widget-button, mention-suggestions aria-labels
- [ ] Split logo aria-label (brand literal + `homeSuffix`) in site-header + site-footer
- [ ] `tsc --noEmit` + lint clean

## Success Criteria
- No hardcoded English UI string remains in the audit's gap table (verify via grep for the literals).
- Each Kudos section title renders exactly once in both locales.
- `tsc --noEmit` passes (dictionary parity intact).
- Brand literals + "Sun* Annual Awards 2025" caption + `<title>` metadata remain unchanged (still exempt).

## Risk Assessment
- Medium: threading dict into client leaf components. Mitigation: prefer a small `labels` prop from a dictionary-aware ancestor over importing dict into `"use client"` leaves.
- Low: VI heading casing/wording mismatch with design. Mitigation: confirm in Unresolved before merge.

## Next Steps / Unresolved
- Confirm VI heading text + casing: uppercase VI ("TẤT CẢ KUDOS", "KUDOS NỔI BẬT", "BẢNG SPOTLIGHT") vs keep English uppercase headings as design labels. The audit says these are NOT exempt, so default = translate to VI.
- Confirm the "— home" suffix VI wording (e.g. "trang chủ").
