# Implementer Report — 5 Confirmed Fixes (SAA 2025)

## Scope
Behavior-focused fixes to nav highlighting, `<html lang>`, compose double-submit,
anonymous self-like loophole, and hardcoded English link prompt.

## Files Modified

| File | Change |
|---|---|
| `app/components/home/site-header.tsx` | `selected` on each `NavLink` now derived from `usePathname()` (`/` exact, `/awards` and `/kudos` prefix) instead of hardcoded on `/`. |
| `app/components/home/site-header.test.tsx` | Added 3 tests asserting `aria-current="page"` lands on the correct link for `/`, `/awards`, `/kudos`. |
| `app/layout.tsx` | `RootLayout` is now `async`; `<html lang={await getLocale()}>` replaces hardcoded `"vi"`. |
| `app/components/kudos/compose/compose-dialog.tsx` | Added `isSubmittingRef` guard (set synchronously at the top of `handleSubmit`, cleared on validation failure and on dialog close via the existing focus-management effect) so two rapid submits can't both call `onSubmit`. |
| `app/components/kudos/compose/compose-dialog.test.tsx` | Added double-submit regression test; fixed the `toolbar` labels fixture (missing `linkPrompt`) that was failing `tsc`. |
| `app/components/kudos/compose/compose-form-helpers.ts` | `buildKudosPost` now appends a module-scoped monotonic counter to the id (`kudos-new-{ms}-{seq}`, collision-safe even within the same millisecond); every composed post is stamped `sentByCurrentUser: true` and `anonymous: state.anonymous`. |
| `app/components/kudos/compose/compose-form-helpers.test.ts` | Added tests for the new flags and for id uniqueness across back-to-back calls. |
| `app/components/kudos/compose/rich-text-toolbar.tsx` | `RichTextToolbarLabels` gained `linkPrompt`; the link button now calls `window.prompt(labels.linkPrompt)` instead of the hardcoded `"URL"`. |
| `app/components/kudos/compose/rich-text-toolbar.test.tsx` | Fixture updated with `linkPrompt`; added assertion that `window.prompt` is called with the localized label. |
| `app/components/kudos/compose/rich-text-editor.test.tsx` | Fixture updated with `linkPrompt` — required by the type change above; this file is downstream of `RichTextToolbarLabels` (`labels.toolbar` passthrough) and would otherwise fail `tsc`. Not in the original ownership list but the edit is a single-line, mechanical, non-visual test-fixture fix, not the visual component itself. |
| `lib/kudos/kudos-types.ts` | `KudosPost` gained optional `sentByCurrentUser?: boolean` and `anonymous?: boolean`. |
| `lib/kudos/kudos-selectors.ts` | `canLikeKudos`: returns `false` when `post.sentByCurrentUser`; for other posts, `anonymous` posts skip the sender-name comparison (fixes M5); otherwise falls back to the original name check (seed data unaffected). |
| `lib/kudos/kudos-selectors.test.ts` | Added tests: own anonymous post → not likeable; other's anonymous post with nickname colliding with viewer's real name → likeable. |

`lib/i18n/dictionaries/*.ts` were read-only, not touched (they already had `linkPrompt`).

## Tests Status
- `npx tsc --noEmit`: **pass**, 0 errors.
- `npx eslint app lib hooks tests`: **pass**, 0 errors (4 pre-existing `no-img-element` warnings, unrelated files).
- `npx vitest run`: **pass**, 74 files / 440 tests.

## Acceptance Criteria
- [x] Fix 1: nav highlight now pathname-derived; `/`, `/awards`, `/kudos` each tested.
- [x] Fix 2: `<html lang>` reflects `getLocale()`, async `RootLayout` following the existing page pattern.
- [x] Fix 3: synchronous ref guard blocks a second in-flight submit; id is `{timestamp}-{monotonic counter}`, collision-safe. Regression test fires two synchronous clicks and asserts exactly one `onSubmit`/`onClose` call.
- [x] Fix 4: `sentByCurrentUser` blocks self-likes regardless of anonymity; `anonymous` flag skips the name check for other viewers, fixing the M5 false-block. Both new selector tests pass.
- [x] Fix 5: link prompt uses `labels.linkPrompt`; verified via `window.prompt` spy assertion.

## Issues Encountered / Deviations
- `app/components/kudos/compose/rich-text-editor.test.tsx` is outside the listed ownership but required a 1-line fixture fix (`linkPrompt` field) purely because of the `RichTextToolbarLabels` type change in Fix 5 — otherwise `tsc --noEmit` fails. No visual/component code touched, just a test literal.
- No test file exists for `app/layout.tsx`; none was added (none was requested, and there's no existing pattern for testing root layout in this repo).

## Unresolved Questions
None.
