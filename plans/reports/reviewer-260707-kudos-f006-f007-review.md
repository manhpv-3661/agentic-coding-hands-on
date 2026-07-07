# Adversarial Review — F006 "Sun Kudos Live Board" + F007 "Kudos Compose Form"

Reviewed range: `2597b69..cb80db1` (a628f17 feat F006, e6c87e3 docs F006, 71a7c2a feat F007,
cb80db1 docs F007). No independent `reviewer` report exists for either feature anywhere in
`plans/` — confirmed by directory listing before starting.

**Important operational note:** partway through this review, the working tree started
receiving live, uncommitted edits from what appears to be one or two *concurrent*
unattended sessions building a "Kudos like/heart toggle" (see Critical #1 below). Several
files I was asked to inspect (`kudos-card.tsx`, `hashtag-input.tsx`, `image-upload.tsx`,
`anonymous-toggle.tsx`, `recipient-select.tsx`, `field-group.tsx`,
`hooks/use-dismissable-menu.ts`, `lib/kudos/kudos-selectors.ts`, both dictionaries) were
mutated on disk *during* this review. All findings below about F006/F007 are verified
against the actual committed state at `cb80db1` (`git show cb80db1:<path>`), not just
whatever happened to be on disk at read-time — I re-verified every file-level claim against
the commit. The concurrent-edit discovery itself is reported because it's squarely inside
the concern that triggered this review.

---

## Critical

### C1. A second unsupervised session is, right now, overriding a locked "out of scope" decision on the same files under review
`plans/260706-2200-sun-kudos-live-board/clarifications.md:38` locks: *"Like/heart button —
build the toggle interaction? → No"* and F006 shipped `HeartIcon` as a deliberately static,
non-interactive `<span>` (`kudos-card.tsx`, old comment: *"never a `<button>` ... no
`aria-pressed`, no click handler anywhere near it"*).

During this review, the working tree gained **two separate, duplicate plan directories**
created within 2 minutes of each other:
- `plans/260707-0008-kudos-like-toggle/`
- `plans/260707-0010-kudos-like-heart-toggle/`

Both are self-labeled "F008 — Like Kudos" and both are actively rewriting
`kudos-card.tsx`, `kudos-selectors.ts`, `hooks/use-dismissable-menu.ts`, and both
dictionaries — uncommitted, unreviewed, running "unattended (overnight, `--auto`)" per
`plans/260707-0008-kudos-like-toggle/clarifications.md:2-3`, and explicitly justifying
itself by pointing at F006's "deferred, separate follow-up task" wording rather than
getting a human sign-off to *un-defer* it.

Two things this exposes:
1. **Same governance gap the user already suspected, recurring in real time** — another
   session is about to self-commit again with no independent review, on the very topic
   (heart toggle) this repo's own clarifications explicitly fenced off.
2. **A live collision risk** — two differently-named plan dirs for the same feature,
   touching the same files concurrently, is either a duplicate-spawn bug or two competing
   unattended agents. Either way, whichever commits second will likely clobber or conflict
   with the first's edits to `kudos-card.tsx` / `kudos-selectors.ts`.

This is not part of F006/F007 and I did not review its correctness — it isn't finished
(see C2). Flagging it because it's directly on-point for "should I trust unsupervised
sessions self-committing here" and because it's happening on top of the code this review
was asked to check.

### C2. Right now, `npx tsc --noEmit` is RED on this repo — caused by that in-flight work, not by F006/F007
Ran `npx tsc --noEmit` twice, ~7 minutes apart:
- **First run (before the concurrent edits landed):** clean, 0 errors — matches the
  shipped `cb80db1` state.
- **Second run (after the concurrent edits landed):** 7 errors, all from the in-progress
  F008 work adding a required `truncated` field to `ImageUploadLabels` without updating
  `image-upload.test.tsx` / `compose-dialog.test.tsx`.

`npx vitest run` stayed green both times (401 → 413 tests, all passing) because Vitest's
transform doesn't enforce the type contract Vitest's assertions don't check. **This is
exactly the kind of gap a real green-CI dashboard can hide**: type-unsafe, uncommitted code
sitting in the tree while tests still report green.

Action for the user: whatever produced `plans/260707-0008-*` and `plans/260707-0010-*`
should be stopped/reconciled before anything else lands — there are two of them mutating
the same files, and the tree is currently not type-safe.

---

## High

### H1. Confirmed shipped i18n bug: `kudos.compose.images` left in English inside `vi.ts`
Verified directly against the commit (`git show cb80db1:lib/i18n/dictionaries/vi.ts`,
lines 288–293):

```ts
images: {
  label: "Image",     // should be "Hình ảnh"
  add: "+Image",      // should be "+Ảnh"
  max: "Tối đa 5",     // correctly translated
  remove: "Xóa ảnh",   // correctly translated
},
```

Every sibling key in the same block is properly translated Vietnamese; only `label` and
`add` were left as English placeholders. This is exactly the bug class the task called
out — "leftover placeholder text," the same class that slipped through the earlier i18n
session. The parity test (`lib/i18n/dictionaries/parity.test.ts`) only checks **key-set**
equality (`collectKeys` compares dot-paths, never values), so it structurally cannot catch
this — it passed cleanly on a broken translation. (Note: as of this review the working
tree already has a fix for this in-flight from the concurrent edit described in C1/C2 —
but the fix landing by coincidence doesn't change that it shipped broken in `cb80db1`.)

### H2. No submit-guard on the compose dialog — a double-click produces two Kudos posts
`compose-dialog.tsx`'s submit button has no `disabled`/in-flight guard:

```tsx
<button type="button" onClick={handleSubmit} ...>{labels.submit}</button>
```

`handleSubmit` validates against the current (stale, not-yet-reset) `state` and calls
`onSubmit(buildKudosPost(...))` synchronously. Two rapid clicks (or Enter-then-click) fire
`handleSubmit` twice before the first click's `resetAndClose()` re-renders the dialog
closed, producing two `KudosPost`s from one submission. The `id` is
`` `kudos-new-${now.getTime()}` `` (millisecond resolution) so on a fast enough double-fire
the two posts could even collide on `id`. Low blast radius (session-scoped mock data,
no backend to corrupt) but it's a real, user-triggerable correctness bug, not a hardening
nice-to-have — and it's the kind of bug that's invisible in a scripted `userEvent.click`
test that only ever clicks once (which is exactly what
`tests/unit/kudos-compose.test.tsx` and `compose-dialog.test.tsx` do — neither exercises a
double-click).

**Fix:** track `isSubmitting` (or just disable the button synchronously inside
`handleSubmit` before calling `onSubmit`), and mint the id from something collision-safe
(a monotonic counter or `crypto.randomUUID()`) rather than `Date.now()`.

---

## Medium

### M1. `en.ts` / `vi.ts` blew past the 200-line file-size convention
`development-rules.md` caps files at 200 lines. At `cb80db1`:
- `en.ts`: 166 → 269 lines
- `vi.ts`: 188 → 303 lines
- `kudos-data.ts` (new file): 212 lines

The dictionaries were already close to the cap before this feature and this feature pushed
both well over it (vi.ts by ~50%). Splitting per-namespace dictionary files (e.g. a
`kudos.ts` slice merged into `vi`/`en`) was the documented escape hatch used elsewhere in
this repo's own `field-group.tsx` comment ("pulled out to keep the dialog shell itself
under the 200-line file cap") — the same discipline wasn't applied to the dictionaries
themselves.

### M2. `RichTextToolbar`'s "insert link" prompt is hardcoded English, never localized
`rich-text-toolbar.tsx`:
```tsx
const url = typeof window !== "undefined" ? window.prompt("URL") : null;
```
The `"URL"` string shown in the native browser prompt is hardcoded regardless of locale —
every other user-facing string in this feature routes through `dictionary.kudos.compose`,
but this one native-dialog label doesn't. Small, but it's precisely the "hardcoded string
that should have gone through the dictionary but didn't" class asked about. (The inserted
link itself is harmless — see L1 below for why.)

### M3. Dead i18n key: `images.truncated` was defined in both dictionaries but never wired into the component
At `cb80db1`, `en.ts`/`vi.ts` both already declare `kudos.compose.images.truncated`
("Image limit reached — some photos were skipped." / "Đã đạt giới hạn ảnh, một số ảnh
không được thêm."), but `ImageUploadLabels` in the shipped `image-upload.tsx` only accepts
`{ add, max, remove }` — no `truncated` field, and the component silently drops files past
`remainingCapacity` with zero user feedback:
```ts
onChange([...value, ...selected.slice(0, remainingCapacity)]);
```
So a user who selects 3 images with 1 slot left silently gets 1 added, 2 dropped, no
message — despite the translated warning already sitting in the dictionary unused. FR-15
doesn't *require* this per `phase-06-image-upload.md` ("not required, no validation
error"), but shipping a translated string for a warning that's never shown is a real
gap between "written" and "wired." (Also currently being patched by the concurrent
in-flight edit from C1 — irrelevant to what actually shipped in `cb80db1`.)

### M4. `CopyLinkButton` always shows "Link copied" even when the clipboard write fails
```tsx
try {
  if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(link);
} catch { /* ... */ }
setCopied(true);   // unconditional — runs even after the catch
```
The comment justifies this as "harmless best-effort," but it's misleading UX: on an
insecure context or permission failure, the user is told the link copied when it didn't.
Cheap fix: only `setCopied(true)` on the success path, or track a `copyFailed` state and
show a different label.

---

## Low / Suggestion

### L1. Rich-text "insert link" accepts any `window.prompt` input, including `javascript:` — but it's a non-issue by design
`exec("createLink", url)` runs `document.execCommand` against the `contentEditable` DOM
directly on whatever the user typed into `window.prompt("URL")`, with no scheme
allowlist. In a "real" rich-text editor this would be a stored-XSS vector. Here it isn't,
because (per the component's own accurate docstring, verified by reading the code) only
`textContent` is ever read back into `onChange`/`KudosPost.content` — the anchor markup
itself is thrown away the moment `handleInput` runs. Confirmed no
`dangerouslySetInnerHTML`/`innerHTML` anywhere in `app/components/kudos` or `lib/kudos`.
Noting only because a future contributor might "upgrade" this editor to persist HTML
without noticing this landmine.

### L2. `recipientOptions`/`mentionNames` are computed once, server-side, from the static `KUDOS_POSTS` seed
A Kudos submitted mid-session never becomes selectable as a future recipient or a `@mention`
target in the same session (the dropdown/mention list is frozen at initial `page.tsx`
render). Consistent with the documented "no employee directory, mock dataset is the
database" scope — not a bug, just a real limitation worth having on record if someone
later assumes recipient options are live.

### L3. `AnonymousToggle.nicknameLabel` uses the English loanword "Nickname" in `vi.ts` ("Nickname ẩn danh")
Common enough as Vietnamese internet slang that this is plausibly intentional (mirrors the
placeholder value "Doraemon," itself deliberately playful), not flagging as a bug — just
noting it's the one spot where a literal English word sits inside otherwise-Vietnamese
copy, in case that wasn't a deliberate choice.

---

## What checked out clean

- **Anonymous-sender path (the thing most worth getting right): no leak.**
  `buildKudosPost` in `compose-form-helpers.ts` replaces `sender` with
  `{ name: nickname.trim(), department: "", stars: 0 }` whenever `anonymous` is true — the
  real `currentUser` object (name, department, stars) never touches the resulting
  `KudosPost` on the anonymous path. Verified by reading `buildKudosPost` directly and by
  the passing `tests/unit/kudos-compose.test.tsx` "anonymous submit" test, which asserts
  the nickname (not the real name) renders on the card.
- **No `dangerouslySetInnerHTML`/`innerHTML` anywhere in the Kudos tree.** The rich-text
  editor genuinely only ever persists `el.textContent`; formatting commands
  (`document.execCommand`) are visual-only and never survive into `KudosPost.content`.
  Confirmed by direct read, not just the docstring's claim.
- **Tests are behavior-focused, not tautological.** `tests/unit/kudos-compose.test.tsx`
  drives the real `/kudos` page + real dictionary + real `KUDOS_POSTS` fixture (12 posts,
  max 60 hearts, deliberately chosen so a fresh `hearts: 0` post can't accidentally land in
  the Highlight top-5 — a nice touch that avoids a flaky/ambiguous assertion). Validation,
  anonymous, Escape-discards-draft, and cancel-discards-draft are all exercised against
  real DOM interactions (`userEvent`), not mocked-away internals.
- **`requireUser()` guard intact** on `/kudos` (`app/kudos/page.tsx:65`), server-side,
  unchanged from the F002 placeholder it replaced — confirmed by reading the current file.
- **File-size discipline elsewhere in the component tree**: every `.tsx`/`.ts` file in
  `app/components/kudos/compose/**` and the rest of the Kudos tree is comfortably under
  200 lines (the two dictionaries and `kudos-data.ts` are the only breaches — see M1).
- **Backward compatibility with F006**: `KudosPost.title?` and
  `KudosBanner.composerTriggerProps?` are both optional, additive fields; every F006 test
  file gained new `it()` blocks without modifying existing assertions (confirmed via
  `git diff 2597b69..cb80db1 -- app/components/kudos/kudos-card.test.tsx
  app/components/kudos/kudos-banner.test.tsx`).
- **Evidence-gate claims vs. reality**: the prior session's `inspection-verdict.json` for
  both features claims specific, checkable things (dialog role/aria-modal, validation
  wiring, anonymous substitution shape, additive F006 contract, dictionary parity, 4/4
  green gates). I independently re-verified each of those specific claims by reading the
  named files/lines, and they all check out as stated — the self-reported verdict wasn't
  fabricated. The problems in this report (H1/H2/M1-M4) are all things the self-review's
  own acceptance-criteria list never asked about (i18n *content* correctness beyond key
  parity, double-submit hardening, dead-key wiring, file-size discipline) — gaps in what
  was checked, not lies about what was checked.

---

## Actual current tool results (run by me, not trusted from evidence files)

- `npx tsc --noEmit` — **clean (0 errors)** on the committed `cb80db1` tree at the start of
  this review; **7 errors** later in the same session once the concurrent F008 work landed
  uncommitted changes (see C2 — not attributable to F006/F007).
- `npx vitest run` — **401/401 passed, 73 files** at the start; **413/413 passed, 74
  files** after the concurrent edits added more tests. Green throughout, both times.
- `npx eslint app/components/kudos lib/kudos lib/i18n app/kudos tests/unit/kudos-compose.test.tsx hooks/use-carousel.ts`
  — **0 errors, 1 warning** (`jsx-a11y/role-supports-aria-props` on
  `recipient-select.tsx`'s `aria-invalid` on a `<button>`). That specific line is part of
  the concurrent in-flight edit, not the `cb80db1` shipped code (the shipped
  `RecipientSelect` didn't have `aria-invalid` on the trigger button at all — confirmed via
  `git show cb80db1`). No lint issues attributable to the actual F006/F007 commits were
  found.

---

## Severity summary

| # | Severity | Finding |
|---|----------|---------|
| C1 | Critical (process) | Concurrent unattended session(s) overriding a locked scope decision, unreviewed, live, on the same files |
| C2 | Critical (process) | `tsc --noEmit` currently red due to that in-flight work |
| H1 | High | `vi.ts` shipped with `images.label`/`images.add` left in English |
| H2 | High | No submit-guard → double-click can create duplicate Kudos posts |
| M1 | Medium | Dictionaries breached the 200-line file cap by 35–60% |
| M2 | Medium | "Insert link" prompt label hardcoded English, not localized |
| M3 | Medium | `images.truncated` translated but never wired into `ImageUpload` |
| M4 | Medium | "Link copied" toast shows even when clipboard write fails |
| L1 | Low | Unsanitized link-insert input, but inert by design (textContent-only) |
| L2 | Low | Recipient/mention options frozen at initial page load (documented limitation) |
| L3 | Low | "Nickname" loanword in vi.ts (plausibly intentional) |

## Unresolved questions
1. Why do `plans/260707-0008-kudos-like-toggle/` and `plans/260707-0010-kudos-like-heart-toggle/`
   both exist, created minutes apart, for the same feature? Two competing unattended runs,
   or one restarted mid-flight without cleaning up the first attempt?
2. Was "no like/heart toggle" actually meant to be permanently out of scope, or was it
   understood as "defer to a follow-up" that any session could pick up unilaterally? The
   F008 clarifications.md reads the latter into F006's wording; worth the repo owner
   confirming which was intended before that work is allowed to land.
