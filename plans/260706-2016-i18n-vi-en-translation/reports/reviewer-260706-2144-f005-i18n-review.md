# Reviewer report — F005 real VI/EN i18n

## Scope
- Read: spec (feature.md FR-1..FR-12), clarifications.md (7 decisions), plan.md, all 4 researcher catalog reports.
- Files: `lib/i18n/**` (new, 9 files), `app/**/*.tsx` (~35 modified), `e2e/i18n.spec.ts` + `e2e/i18n-content.spec.ts` (new), `playwright.config.ts`, plus new unit test files. ~1026 insertions / 346 deletions across 48 tracked changes + untracked new files.
- tsc/vitest/playwright already verified green by requester — not re-run; this review is code-reading only.

## Overall assessment
Solid, disciplined implementation. Architecture matches the plan exactly (Server reads locale → dict slice → props down, Client components never touch cookies). DRY consolidation, factory refactor, and brand/proper-noun exclusions are all correctly done. Found **one real translation-fidelity bug** that ships broken spacing in the English locale on the Awards detail page, missed by all three test layers (unit, E2E, tsc — none of them can catch a string-content spacing defect).

## Critical Issues
None (see High Priority — the one bug found is UI-visible but not a security/data issue).

## High Priority

**EN award quantity/value labels are missing their trailing space, VI has it — squished text in production.**

- `lib/i18n/dictionaries/vi.ts:149-150`: `quantityLabel: "Số lượng giải thưởng: "`, `valueLabel: "Giá trị giải thưởng: "` — both end with `": "` (colon + space).
- `lib/i18n/dictionaries/en.ts:130-131`: `quantityLabel: "Number of awards:"`, `valueLabel: "Award value:"` — both end with just `":"`, no trailing space.
- Consumed at `app/components/awards/award-detail-card.tsx:128,139`: `` `${quantityLabel}${quantity}` `` / `` `${valueLabel}${value}` `` — plain concatenation, no space inserted by the component, and none of the `quantity`/`value` dictionary strings (`en.ts:140-161`) have a leading space either.
- Net effect: VI renders `"Số lượng giải thưởng: 10 Đơn vị"` (correct spacing) but EN renders `"Number of awards:10 Units"` and `"Award value:7,000,000 VND per award"` (colon glued to the number) on every one of the 6 award detail cards, in production, for every EN user.
- Not caught by any test: `award-detail-card.test.tsx:18-19,41-42` only ever passes `viDictionary.awards.detail.{quantityLabel,valueLabel}` — it never exercises the EN dictionary through this component. `e2e/awards-content.spec.ts` never sets `NEXT_LOCALE=en` either. `dictionaries/parity.test.ts` only asserts key-set equality, not value-shape/formatting equivalence, so it structurally cannot catch this.
- Fix: add the trailing space to both EN dictionary values (`"Number of awards: "`, `"Award value: "`) to match VI's convention, OR (cleaner long-term) move the separating space out of the dictionary and into the component's template (`` `${quantityLabel} ${quantity}` ``) so locale strings don't need to smuggle layout whitespace — the researcher report (`researcher-260706-catalog-awards.md:33`) actually suggested the latter pattern explicitly and the implementation didn't follow it for this one spot.

## Medium Priority

**`e2e/i18n-content.spec.ts` docstring overclaims coverage vs. what Test B actually runs.** The comment block (lines 6-9, 17-19) says Test B navigates to `/`, `/awards`, `/prelaunch` and asserts first-paint EN, but the test body (lines 27-51) only covers `/` (B.1) and `/awards` (B.2) — there is no B.3 for `/prelaunch` in this file. Not a functional gap: `/prelaunch` EN first-paint IS covered by `e2e/prelaunch-countdown.spec.ts:36-48` (port-3200 build), so no missing coverage overall — just a stale/inaccurate comment in `i18n-content.spec.ts` that should either add the `/prelaunch` case or drop it from the docstring.

## Low Priority
None beyond the above — no style nitpicks worth raising.

## Detailed check results (per the 7 requested areas)

1. **Security** — `lib/i18n/get-locale.ts:19-24` calls `isLocale(raw)` (`lib/i18n/locale.ts:17-19`, `Array.prototype.includes` against a fixed 2-element readonly tuple) before ever touching the dictionary; `getDictionary()` (`lib/i18n/get-dictionary.ts`) uses a plain ternary (`locale === "en" ? en : vi`), never a dynamic `dict[locale]` lookup — no prototype-pollution or crash vector exists even in principle, cookie tampering just falls through to the `"vi"` default. Dictionaries are 100% public UI copy; no secrets, tokens, or PII anywhere in `dictionaries/{vi,en}.ts`. Clean.

2. **Correctness vs spec** — Spot-checked pull-quote (EN correctly drops the VI parenthetical, `en.ts:76` vs `vi.ts:90-91`), Root Further paragraphs (verbatim/faithful long-form translation), awards long descriptions (5 categories — topTalent/topProject/topProjectLeader/bestManager/mvp — share `sharedUnfinished` verbatim in both locales; `signatureCreator` is the one distinct entry, confirmed in both `vi.ts:154-157` and `en.ts:133-136`), and brand/proper-noun exclusions (Sun*, SAA, Kudos, all 6 award category names, "Âu Cơ Art Center", eyebrow "Sun* annual awards 2025" — all hardcoded/untranslated in both locales per grep across `event-info.tsx`, `awards-section.tsx`, `sun-kudos-section.tsx`, `app/awards/page.tsx`). Only defect found is the quantityLabel/valueLabel spacing bug above.

3. **Architecture / RSC boundary** — `grep -rl "use client"` cross-referenced against `cookies`/`next/headers` usage: zero client components import either. `LanguageSelector` (`app/login/components/language-selector.tsx:45-79`) takes `initialLocale` as its `useState` seed (fixes the FR-5 bug) and calls `router.refresh()` after writing the cookie. Wired correctly from both call sites: `login-header.tsx:18,28` (passes `initialLocale` from `login/page.tsx:67`) and `site-header.tsx:40,72` (passes `locale` from `app/page.tsx:98-99` and `app/awards/page.tsx:73-74`, both `getLocale()`-sourced).

4. **DRY** — `login.error.oauthFailed`: single key, read at `login/page.tsx:61,72` and forwarded into `login-button-container.tsx` as the `oauthFailed` prop used at both its internal call sites (`login-button-container.tsx:60,66`). `shared.footer.copyright`: single key, read once in `login/page.tsx:79` (→ `LoginFooter`) and once in `app/page.tsx:112`/`app/awards/page.tsx:107` (→ `SiteFooter`) — both components render the same prop, no independent hardcoded copy remains anywhere.

5. **`buildAwardDetailEntries` factory** — `award-detail-data.ts:73` maps positionally over `AWARD_CATEGORIES` (`lib/awards/award-categories.ts`), and `STATIC_ENTRY_META` (lines 22-57) is ordered identically: top-talent → top-project → top-project-leader → best-manager → signature-2025-creator → mvp. Index-for-index match confirmed; F004 hash-anchor slugs stay intact.

6. **Type safety** — `Dictionary` is `typeof vi` (`lib/i18n/dictionary.ts:8`); `en.ts:166` closes with `satisfies Dictionary`. `dictionaries/parity.test.ts:58-71` proves the guard is load-bearing: it mutates a deep-copied VI object (deletes `shared.nav.aboutSaa`) and asserts the resulting key-sets diverge, demonstrating the recursive key-set comparison actually detects drift (the runtime analogue of what `satisfies` catches at compile time — spec explicitly allows either).

7. **Test quality** — `get-locale.test.ts` exercises all 4 branches (valid vi/en, missing, garbage "fr") with a proper `next/headers` mock, non-tautological. `get-dictionary.test.ts` and `parity.test.ts` assert real key/value content, not just "doesn't throw". E2E `i18n.spec.ts` (Test A: login switch, Test E: default-VI-on-clear-cookie) and `i18n-content.spec.ts` (Test B/C/D: SSR first-paint, revert, reload-persistence — the last one is the direct FR-5 regression guard) all assert on real translated strings sourced from the dictionaries, not placeholder/tautological checks. One doc/coverage-claim mismatch noted above (Medium).

## Positive observations
- Comment discipline throughout `lib/i18n/**` and every touched component is unusually good — each prop documents exactly which dict key it sources from and why, which made this review fast and traceable.
- The `buildAwardDetailEntries` docstring explicitly calls out "do not shorten, paraphrase, or invent copy" — the kind of guardrail comment that prevents future regressions.
- `parity.test.ts`'s self-proving mutation test (line 58-71) is a nice pattern — proves the test harness itself works, not just that dictionaries currently match.

## Recommended actions
1. **Fix the EN label spacing bug** in `lib/i18n/dictionaries/en.ts:130-131` (add trailing space, or refactor the two call sites in `award-detail-card.tsx:128,139` to insert the space in the template instead of relying on the dictionary string). Add an EN-locale case to `award-detail-card.test.tsx` so this class of bug can't silently return.
2. (Optional, low cost) Tighten `e2e/i18n-content.spec.ts`'s Test B docstring to match its actual scope, or add the `/prelaunch` first-paint assertion directly in that file for locality.

## Unresolved questions
None — spec/clarifications fully cover the implementation's scope; no ambiguity encountered during review.

**Status:** DONE_WITH_CONCERNS
**Summary:** Architecture, security, DRY, type-safety, and translation fidelity are all solid and match spec — except one real bug: EN's `awards.detail.quantityLabel`/`valueLabel` dictionary values are missing the trailing space VI has, so the Awards detail page renders "Number of awards:10 Units" (no space after colon) for every EN user; untested by any of the three test layers.
**Concerns/Blockers:** High-priority translation-fidelity bug in `lib/i18n/dictionaries/en.ts:130-131` (colon-glued-to-number spacing defect on `/awards`, EN locale only) should be fixed before delivery. One low-priority stale-docstring nit in `e2e/i18n-content.spec.ts`.
