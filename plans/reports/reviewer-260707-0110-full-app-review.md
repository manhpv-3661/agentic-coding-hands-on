# Adversarial Full-App Review — SAA 2025 (`main` @ 14449a9)

Scope: all screens (`/`, `/login`, `/awards`, `/kudos`, `/prelaunch`), `proxy.ts`, i18n
dictionaries, `lib/kudos`, `lib/awards`, `lib/auth`, `hooks`. Tool results at time of review:
`npx tsc --noEmit` clean (0 errors); `npx vitest run` 426/426 passed, 73 files.

Prior review reference: `plans/reports/reviewer-260707-kudos-f006-f007-review.md` (F006/F007,
commit `cb80db1`). This report re-verifies its open items against current `main` and adds
new findings from F008 (`7d7d3c5`) and a full-app sweep.

---

## Re-verification of prior findings

| # | Finding | Status now | Evidence |
|---|---|---|---|
| H1 | `vi.ts` `images.label`/`add` left English | **Fixed** | `lib/i18n/dictionaries/vi.ts:291-292` now "Hình ảnh"/"+Ảnh" |
| H2 | No submit-guard on compose dialog — double-click double-posts | **Still open** | see Critical C1 below |
| M2 | `window.prompt("URL")` hardcoded, not localized | **Still open** | `app/components/kudos/compose/rich-text-toolbar.tsx:52` unchanged |
| M3 | `images.truncated` dead key, never wired | **Fixed** | `image-upload.tsx:34,55,111` now sets/shows `truncated` on selection cap |
| M4 | `CopyLinkButton` shows "copied" even on clipboard failure | **Still open** | `copy-link-button.tsx:48` `setCopied(true)` unconditional after the `catch` |

Commit `6fcdc43` ("harden F007 ... interactions") fixed H1/M3 and added real value (focus
trap, aria-describedby, per-field error clearing, live filter options) but its own commit
message oversells "harden ... interactions" — it did not touch `handleSubmit`'s double-submit
path at all (confirmed via `git diff 71a7c2a 6fcdc43 -- compose-dialog.tsx`: only line changed
in `handleSubmit` is `resetAndClose()` → `onClose()`).

---

## Critical

### C1. Compose dialog still has no submit-guard — H2 from the prior review is unresolved
`app/components/kudos/compose/compose-dialog.tsx:129-149`. `handleSubmit` is a plain
synchronous `onClick` handler with no `isSubmitting`/disabled state:
```tsx
onSubmit(buildKudosPost(state, currentUser, new Date()));
onClose();
setToast(true);
```
The submit `<button>` (line 244-250) has no `disabled` binding tied to in-flight state. A
second click before the first click's `onClose` re-render commits still calls `handleSubmit`
again against the same (not-yet-reset) `state`, producing two `KudosPost`s from one
submission. `buildKudosPost` mints `id: \`kudos-new-${now.getTime()}\`` (millisecond
resolution, `compose-form-helpers.ts:75`) — a fast enough double-fire can even collide on
`id`, and `likedIds` in `kudos-page-client.tsx` is keyed by that same id, so a collision would
make liking one duplicate silently "like" the other too.
No test exercises a rapid double-click anywhere in `compose-dialog.test.tsx` or
`kudos-page-client.test.tsx` (grepped for `double`/`isSubmitting` — zero hits).
**Fix:** disable the submit button synchronously on first click (local `isSubmitting` state,
or check `toast`/an explicit ref flag before running `handleSubmit`'s body) and/or mint IDs
from a collision-safe source (`crypto.randomUUID()`, monotonic counter).

### C2. F008's `canLikeKudos` has no way to detect "this is my own anonymous post" — self-liking your own anonymous Kudos is possible
`lib/kudos/kudos-selectors.ts:14-16`:
```ts
export function canLikeKudos(post: KudosPost, currentUser: KudosPerson): boolean {
  return post.sender.name !== currentUser.name;
}
```
`compose-form-helpers.ts:76-78` — when a post is submitted anonymously, `sender` is fully
replaced with `{ name: nickname.trim(), department: "", stars: 0 }`; the real
`currentUser` is discarded (correct, by design, for the anonymity guarantee). But this means
`canLikeKudos` — which is the *only* gate for FR-4 ("you cannot like a Kudos you authored") —
has zero signal left to detect true authorship once a post is anonymous. A user who composes
an anonymous Kudos (a normal, supported flow) can then like it themselves, inflating their own
`displayHearts` count, because `post.sender.name` ("Doraemon" or whatever nickname) will
almost never equal `currentUser.name`. This is a real, reachable violation of the feature's
own documented rule, not a hypothetical — the anonymous compose flow and the like-toggle flow
are both shipped, session-scoped, and interact this way today. No test in
`kudos-page-client.test.tsx` or `kudos-selectors.test.ts` submits an anonymous post and then
attempts to like it (grepped both files — zero anonymous+like overlap).
**Fix options:** track true-author id separately from display `sender` (e.g. an
`authorName`/`authoredBy` field on `KudosPost` not rendered anywhere, checked by
`canLikeKudos` instead of `sender.name`), or disable liking client-side for any post the
current session just submitted (track submitted-post ids in `KudosPageClient` alongside
`likedIds`).

---

## High

### H3. Root `<html lang="vi">` is hardcoded — wrong for every page once a user switches to English
`app/layout.tsx:20-33` is a plain (non-async) Server Component; `lang="vi"` is a literal, never
read from `getLocale()`/the `NEXT_LOCALE` cookie:
```tsx
<html lang="vi" className={...}>
```
This predates F005 but F005 (`8080fb2`) shipped full VI/EN content switching
(`app/login/components/language-selector.tsx` writes the `NEXT_LOCALE` cookie and calls
`router.refresh()`; every page's `generateMetadata`/body content reads `getLocale()` and
renders real English copy — confirmed in `lib/i18n/dictionaries/en.ts`, `app/awards/page.tsx`,
`app/kudos/page.tsx`, `app/prelaunch/page.tsx`). So today: pick "EN" in the header language
switcher → every page's *visible text* is English, but the document's declared language stays
`vi` for assistive tech and browser translate/pronunciation heuristics on 100% of routes, not
just `/login` (the narrower, already-flagged issue in the login-screen memory note). This is a
real regression surface introduced by F005 landing without updating the one place `lang` is
set.
**Fix:** make `RootLayout` `async`, `const locale = await getLocale()`, `<html lang={locale}>`
— `getLocale()` is already safe to call from any Server Component (see `get-locale.ts`).

---

## Medium

### M5. Anonymous nickname collision breaks `canLikeKudos` for unrelated real users
Same root cause as C2, different direction. `canLikeKudos` treats name equality as identity
(`kudos-selectors.ts:14`, doc comment admits "there is no id field on `KudosPerson`"). The
seed data (`kudos-data.ts`) already has multiple common Vietnamese names; the anonymous
compose flow lets any sender type an arbitrary free-text nickname
(`anonymous-toggle.tsx`/`compose-form-helpers.ts:77`, no uniqueness/collision check against
`recipientOptions`). If that nickname happens to match a *real, unrelated* Sunner's display
name — plausible with common names, and trivially reproducible by typing that name on
purpose — `canLikeKudos(post, currentUser)` returns `false` for that real Sunner, silently
blocking them from liking a post that isn't actually theirs. Pre-existing architectural
limitation (also affects `getDistinctRecipients`), but F008 is the first feature to attach a
user-facing permission decision to that same weak identity, giving it a visible bug surface it
didn't have before.

### M6. `RichTextToolbar`'s "insert link" prompt still hardcoded English (M2, unresolved)
`rich-text-toolbar.tsx:52`: `window.prompt("URL")` — every other user-facing string in this
tree goes through `dictionary.kudos.compose`; this native dialog's label doesn't, in either
locale.

### M7. `CopyLinkButton` still reports false success on clipboard failure (M4, unresolved)
`copy-link-button.tsx:37-51`: `setCopied(true)` executes unconditionally after the try/catch,
so a failed `navigator.clipboard.writeText` (insecure context, permission denial) still shows
"Link copied" to the user.

---

## Low / Suggestion

### L4. `MentionSuggestions`'s `aria-label="mention-suggestions"` is a raw, non-localized dev-ish string
`mention-suggestions.tsx:48` — screen readers announce the literal English string
"mention-suggestions" regardless of locale, the one accessible-name string in this component
tree that isn't dictionary-sourced. Cosmetic (listbox already has visible, correctly-labeled
options) but inconsistent with the rest of F007's i18n discipline.

### L5. `RecipientSelect`/`MentionSuggestions` `role="listbox"`/`role="option"` pattern uses real
focusable `<button>` children instead of `aria-activedescendant` + roving tabindex
`recipient-select.tsx:76-90`, `mention-suggestions.tsx:52-66`. Functionally keyboard-operable
(Tab reaches each option, Enter/Space activates) but not the ARIA-spec-conformant listbox
interaction model (arrow-key roving focus). Same pattern in both components — consistent, not
a regression, just worth a follow-up if a stricter a11y audit is ever run.

---

## What checked out clean (full-app sweep)

- **`proxy.ts` time-gate + auth-gate**: `isBeforeLaunch` fails open on missing/invalid env
  (`event-countdown.ts`), auth check fails open only when Supabase env is absent (with a
  one-time console warning), matcher correctly excludes `/prelaunch` and Next internals.
  Order of checks (time-gate before auth-gate) is correct — verified by reading, not just the
  docstring.
- **Open-redirect guard intact end-to-end**: `proxy.ts` sets `?next=<pathname+search>` on the
  prelaunch redirect; `hooks/use-prelaunch-auto-redirect.ts:22` runs it through
  `sanitizeInternalPath` (`lib/safe-redirect.ts`, rejects absolute/`//` URLs) before
  `router.replace`. No way to smuggle an external redirect via the `next` param.
  `app/auth/callback/route.ts` was noted as mirroring the same check (not independently
  re-read this pass, but referenced consistently by both `safe-redirect.ts`'s docstring and
  the prior login-screen review).
- **Login screen's two previously-flagged issues are both actually fixed**: `app/layout.tsx`
  no longer says `lang="en"` for Vietnamese content (though see H3 — it now has the *opposite*
  problem post-i18n) and `LoginButton`/`LoginButtonContainer` are both real `"use client"`
  components with a clean prop boundary — no unused-`onClick`-on-a-Server-Component footgun
  found (memory's `GoogleLoginButton` concern doesn't reproduce under the current file names).
- **`useCarousel`/`useScrollSpy` resync patterns**: both correctly reset derived state
  synchronously during render when their key input changes (slide count / observed id set),
  avoiding stale-index and stale-active-section bugs across filter changes — read both hooks
  in full, no gap found.
- **F008 prop-drilling (`KudosPageClient` → `KudosBoard` → `HighlightKudosCarousel`/
  `AllKudosFeed` → `KudosCard`)**: `likedIds`/`currentUser`/`onToggleLike` forwarded unchanged
  through every layer, no local shadowing. `toggleLike` in `kudos-page-client.tsx:60-70`
  correctly clones the `Set` (`new Set(previous)`) before mutating — no shared-reference bug.
  `getTopKudosByHearts` sorts on `post.hearts` only (never touched by `liked` state), so
  carousel order is stable across like/unlike — confirmed by reading `kudos-selectors.ts:55-57`
  and `kudos-card.tsx:115` (`displayHearts` is a render-only derived value, `post.hearts` is
  never mutated).
- **Own-post gating**: `KudosCard`'s heart button is real-`disabled` (not just visually dimmed)
  for `isOwnPost`, and `onClick` still calls through `onToggleLike?.(post.id)` only when not
  disabled — `kudos-card.test.tsx` "disables the heart for own post" test clicks the disabled
  button and asserts `onToggleLike` was never called, i.e. it isn't just a CSS-only disable.
- **Empty/0-post states**: both `HighlightKudosCarousel` and `AllKudosFeed` render
  `emptyLabel` and return before touching `posts[0]` — no unguarded index access. Filter
  options (`hashtagOptions`/`departmentOptions`) are derived from the *unfiltered* `posts`
  list, not the filtered view, so selecting a filter never causes its own option to disappear
  from the dropdown (no deselection-loop bug).
- **Duplicate id namespace**: seed data uses `kudos-N`, compose-generated posts use
  `kudos-new-<timestamp>` — no collision between the two families (only within rapid
  double-submits of the same family, see C1).
- **i18n dictionary content, read start-to-end (not just key parity)**: `en.ts` (271 lines) is
  entirely English, `vi.ts` (305 lines) entirely Vietnamese except the previously-noted L3
  ("Nickname ẩn danh" loanword, still present, still plausibly intentional/slang). No other
  cross-contaminated strings found in either file.
- **`npx tsc --noEmit`**: clean, 0 errors, on the current tree (no repeat of the prior
  session's transient concurrent-edit type errors — that in-flight work is now committed and
  resolved).
- **`npx vitest run`**: 426/426 passed, 73 files, no skipped/flaky output.

---

## Severity summary

| # | Severity | Finding |
|---|----------|---------|
| C1 | Critical | Compose dialog double-submit still unguarded (H2 from prior review, unresolved) |
| C2 | Critical | Anonymous compose + like toggle interaction lets a user like their own anonymous post |
| H3 | High | Root `<html lang="vi">` hardcoded — wrong for every route once EN locale is selected |
| M5 | Medium | Anonymous nickname collision can wrongly block an unrelated real user from liking a post |
| M6 | Medium | "Insert link" prompt hardcoded English (M2 from prior review, unresolved) |
| M7 | Medium | CopyLinkButton reports false success on clipboard failure (M4 from prior review, unresolved) |
| L4 | Low | Non-localized `aria-label` on mention suggestions listbox |
| L5 | Low | Listbox patterns use focusable children instead of aria-activedescendant (functional, not spec-pure) |

## Unresolved questions
1. Is self-liking an anonymous post (C2) actually undesirable, or is it acceptable because the
   mock app has no persistence/leaderboard consequence beyond a session-scoped count? Flagging
   as Critical because it silently breaks the feature's own stated rule (FR-4), but the actual
   product impact is bounded by this being a non-persisted mock.
2. For H3 — was `lang="vi"` a deliberate "VI is still the primary/default audience" choice that
   the team considers acceptable even post-i18n, or an oversight from F005 not touching
   `app/layout.tsx`? Worth a decision either way since it's now inconsistent with the shipped
   EN content.
3. C1 (double-submit) was flagged in the prior review and not fixed despite a "harden ...
   interactions" commit landing in between — worth confirming whether it was seen and
   deliberately deprioritized, or missed.

**Status:** DONE_WITH_CONCERNS
**Summary:** Re-verified prior review: H1/M3 fixed, H2/M2/M4 still open. Full-app sweep found 2
new Critical-severity logic gaps in F008's like toggle (double-submit still unguarded;
anonymous-post self-liking is possible because `canLikeKudos` has no true-author signal once a
post is anonymous) plus a High-severity `lang="vi"` hardcode that's now wrong for the whole app
under the EN locale post-F005. `tsc`/`vitest` both green throughout.
**Concerns/Blockers:** C1 and C2 are both real, user-triggerable logic bugs in shipped code
(not process/governance noise like the prior review's C1/C2) — recommend fixing before further
F008 follow-up work lands on top of them.
