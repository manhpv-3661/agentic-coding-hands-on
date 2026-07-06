# Clarifications — F007 (provisional) Kudos Compose Form

Session runs unattended (overnight, `--auto`). Per orchestrator instruction, gaps are
resolved by taking the recommended/most-consistent-with-precedent option rather than
blocking on `AskUserQuestion`. Recorded below, one line per decision.

## Session 2026-07-06

- Q: Duplicate MoMorph screenIds (`JsTvi8KVQA` empty-state, `RO7O6QOhfJ` filled-state) —
  two different screens or one? → A: **One screen.** `get_frame_node_tree` for both
  returns the identical component instance ("Viết KUDO", same child structure, same
  field order) wrapped in a different outer frame id — only the rendered example
  content differs (placeholder text vs "Tôi rất chi là quý bạn" sample text). No
  behavioral divergence exists. `JsTvi8KVQA` (empty/placeholder) used as the canonical
  default state per orchestrator instruction; `RO7O6QOhfJ` cross-checked only to confirm
  identical structure.
- Q: MoMorph spec/test-case data for this screen? → A: **None exists.** Both screenIds
  return `download_specs`/`download_test_cases` status `"empty"` (`spec_status: none`,
  `dev_status: none`, `item_count: 0`, `test_case_count: 0`) — the design frame exists in
  Figma but no spec rows/test cases were ever authored in MoMorph for it. Requirements
  derived instead from: (a) the orchestrator's detailed field-by-field task description,
  (b) the rendered Figma frame image (`get_frame_image`, both states) — exact labels,
  placeholders, hashtag examples (`#BE OPTIMISTIC`, `#WASSHOI`, `#BE A TEAM`,
  `High-perorming`), image count (5), checkbox + nickname example (`Doraemon`), char
  counter (`0/1.000`), (c) the Figma node tree (`get_frame_node_tree`) confirming field
  order/structure. No invented data — every literal string/example used as UI mock
  content is taken verbatim from the Figma design per `momorph-development.md`'s "use
  Figma content as mock data, do NOT invent data" rule.
- Q: MoMorph Parallel UI Hook — spawn a background Track-A `implementer` UI agent
  separate from Track-B backend/logic (per `momorph-development.md`)? → A: **No —
  build as one coherent unit instead.** This feature has no separate backend surface
  (mock/local-only, same as F006); the "UI" and the "submit logic" (validation, prepend
  to local state, i18n wiring) live in the SAME small set of client components — a
  Track A/Track B split would have two agents editing the same files concurrently
  (real conflict risk, not real parallelism). Deviating from the mechanical two-agent
  spawn while still honoring its intent (derive all UI mock content directly from the
  Figma design, per the decision above) is the reasoned call for this specific
  no-backend shape.
- Q: Provisional feature code? → A: `F007` (next contiguous code after F006; F001-F006
  already exist in `docs/features/`, no `_canonical-fcodes.json`/`feature-list.md`
  registry exists in this repo — F001-F006 were each written directly to
  `docs/features/f0XX-slug/feature.md` without a separate plan-dir-draft-then-promote
  step). Following that exact same direct-write local convention for F007.
- Q: Spec doc shape — generic rebuild-spec 4-file set or this project's existing
  single-`feature.md` convention? → A: single `feature.md`, matching F001-F006
  (`docs/features/f0XX-*/feature.md`, `lang: vi` frontmatter). Same rationale F006 used:
  honor the living codebase convention over the generic template.
- Q: SYSTEM vs SINGLE? → A: SINGLE. One form, one user-facing intent ("compose and send
  a Kudos to a colleague") — the many fields (recipient/title/rich text/hashtags/
  images/anonymous) are sub-parts of one form, not separate flows.
- Q: Spec language (`spec_lang`)? → A: `vi`, inherited from the established F001-F006
  convention (same reasoning F006 recorded — `docs/.rebuild-state.json` has no
  `primary_lang` in this repo, but the real convention is unambiguous).
- Q: Persistence strategy for a submitted Kudos (`lib/kudos/kudos-data.ts`'s
  `KUDOS_POSTS` is a frozen module-level `const` array — no mutation helper, no
  backend)? → A: **Session-scoped client state, not a data-file mutation.** Lift the
  `posts` list one level up into a new client wrapper component
  (`kudos-page-client.tsx`) that seeds `useState` from the `KUDOS_POSTS` prop and owns
  both the compose-dialog open/close state and an `addPost` handler (prepends to the
  front of the array). `kudos-data.ts` stays a pure static mock module (no
  `addKudosPost()` helper added there) — consistent with `lib/awards/*` and the rest of
  this mock/training project's "frontend-only, no backend" precedent. State is lost on
  refresh; acceptable for this mock project (same spirit as F006's other non-persisted
  interactions).
- Q: Sender identity — no auth→`KudosPerson` mapping exists anywhere in this repo
  (`requireUser()` only returns a raw Supabase user, never mapped to
  `{name, department, stars}`)? → A: add one small mock constant
  `CURRENT_USER: KudosPerson` to `lib/kudos/kudos-data.ts` representing "the logged-in
  Sunner" for this mock/training project (mirrors the existing mock-data-first
  philosophy — no real identity system exists or is in scope to build). Used as
  `sender` for every submitted post (unless anonymous — see below).
- Q: Recipient dropdown data source? → A: derive a distinct-people list from the
  existing `KUDOS_POSTS` senders + recipients (dedupe by name, exclude `CURRENT_USER`)
  via a new pure selector `getDistinctRecipients(posts, currentUser)` in
  `kudos-selectors.ts`, mirroring the existing `getDistinctHashtags`/
  `getDistinctDepartments` pattern. No invented directory/people beyond what the mock
  dataset already contains.
- Q: Entry point — dialog vs a new `/kudos/new` route? → A: **Inline client-mounted
  dialog**, triggered by the existing "Ghi nhận" pill in `kudos-banner.tsx` (confirmed
  no-op placeholder, exactly flagged as deferred in F006's `clarifications.md`). Matches
  this repo's flat one-`page.tsx`-per-feature routing convention (no nested/dynamic
  routes exist anywhere) and the closest existing dialog precedent
  (`open-gift-button.tsx`'s hand-rolled `role="dialog"` pattern, extended here with
  Escape/outside-click via the existing shared `hooks/use-dismissable-menu.ts` since
  this is a real multi-field data-entry form, not a static info dialog).
- Q: Rich text editor — reach for a library (tiptap/slate/quill/lexical)? → A: **No.**
  None is installed (`package.json` confirmed) and none exists elsewhere in the repo.
  Build a minimal `contentEditable`-based editor using `document.execCommand` for
  bold/italic/strikethrough/unordered-list/link/blockquote-style quote (KISS/YAGNI — a
  6-button toolbar over a `contentEditable` div does not warrant a new dependency in a
  mock training project). `@mention` is a lightweight inline suggestion list (filtered
  from the same distinct-people list) that inserts plain `@Name` text — not a rich
  "mention object" — since `KudosPost.content` is a plain string in the existing type
  contract (not touching that contract). Character cap (1000) enforced in the input
  handler against `textContent.length` (mirrors the Figma "0/1.000" counter).
- Q: Hashtag input — reuse anything? → A: custom controlled chip input (max 5, dedupe,
  auto-prefix `#` if the user omits it), mirroring `kudos-filters.tsx`'s plain
  controlled-input style. No tag-input library exists in this repo.
- Q: Image upload — real upload/storage? → A: **No backend/storage exists** (no
  Supabase storage config, no upload API route anywhere in this repo). Accept real
  `<input type="file" multiple accept="image/*">` selection (max 5, client-only
  `URL.createObjectURL` preview + remove-button, matching the Figma thumbnails-with-X
  design), but persist only the resulting `imageCount` (0-5) onto the created
  `KudosPost` — consistent with `KudosImageGallery` already only ever rendering a
  *count* of placeholder tiles, never real image URLs, anywhere in this repo.
- Q: Anonymous toggle behavior — does `KudosPost`/`KudosPerson` need new fields? → A:
  **No type changes to the existing F006 contract.** When "Gửi lời cảm ơn và ghi nhận ẩn
  danh" is checked, the required "Nickname ẩn danh" field's value becomes the created
  post's `sender = { name: nickname, department: "", stars: 0 }` instead of
  `CURRENT_USER` — the feed/card rendering (`KudosCard`, unchanged) then naturally shows
  the nickname instead of the real identity, with no `KudosCard`/`KudosPost` changes
  needed. Empty `department`/`stars: 0` is an accepted, visually harmless trade-off (no
  department chip renders for an empty string).
- Q: "Tiêu chuẩn cộng đồng" (Community Standards) link — real target? → A: **No target
  page exists in this mock project.** Render as a static, non-navigating stub (styled as
  a link, `<span>`/`<button type="button">`, not an `<a href>`) with a code comment,
  mirroring the exact "Xem chi tiết"/Profile stub precedent already established in F006
  (`clarifications.md`: "no navigation... mirrors the exact precedent already set in
  `account-menu-button.tsx`").
- Q: Required fields / validation? → A: Recipient, Danh hiệu (title), rich-text content
  (non-empty), and at least 1 Hashtag are required (all four show a `*` in the Figma
  design); Nickname ẩn danh is required only when the anonymous checkbox is on (also
  shows `*` in the design). Max 5 hashtags, max 5 images, max 1000 content characters —
  enforced live (block further additions past the cap, not just on submit). Inline
  per-field error text on submit attempt with invalid fields (no form library — plain
  `useState` error map, KISS).
- Q: Submit success behavior? → A: close the dialog, prepend the new `KudosPost` to the
  top of the "All Kudos" feed (via the lifted `posts` state — see persistence decision),
  reset the form, and show a small local success confirmation using the exact same
  self-contained `useState` + `setTimeout` toast pattern already used by
  `copy-link-button.tsx` (this repo has no global toast system — confirmed zero other
  hits — and is not the place to introduce one).
- Q: Cancel button behavior? → A: closes the dialog and discards the draft immediately,
  no confirm-discard prompt (no such pattern exists anywhere in this repo; YAGNI).
- Q: "Like" heart toggle on any newly created card? → A: **Not touched** — per
  orchestrator instruction this remains the static, non-interactive `<span>` established
  in F006 (out of scope, owned by a separate follow-up task).
