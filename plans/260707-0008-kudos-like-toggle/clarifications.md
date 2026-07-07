# Clarifications — F008 (provisional) Like Kudos (Thả tim)

Session runs unattended (overnight, `--auto`). Per orchestrator instruction, gaps are
resolved by taking the recommended/most-consistent-with-precedent option rather than
blocking on `AskUserQuestion`. Recorded below, one line per decision.

## Session 2026-07-07

- Q: MoMorph interaction spec for the heart/like control on "Sun* Kudos - Live board"
  (screenId `MaZUn5xHXZ`, fileKey `9ypp4enmFmdK3YAFJLIu6C`)? → A: **None expected and
  none needed for this pass** — F006's own `clarifications.md` explicitly recorded the
  heart as "static, non-interactive... out of scope, separate follow-up task" (i.e. this
  feature). No new MoMorph fetch performed; behavior derived from the orchestrator's
  task description + standard toggle/optimistic-update/no-double-submit UX, consistent
  with how F007 derived requirements when MoMorph had zero specs/test-cases uploaded.
- Q: Provisional feature code? → A: `F008` (next contiguous code after F007; no
  `_canonical-fcodes.json`/registry exists — F001-F007 all direct-write to
  `docs/features/f0XX-slug/feature.md`, same convention followed here).
- Q: Spec doc shape? → A: single `feature.md`, matching F001-F007
  (`lang: vi` frontmatter) — same rationale F006/F007 recorded.
- Q: SYSTEM vs SINGLE? → A: SINGLE. One behavior ("toggle like on a Kudos card") layered
  onto an existing screen — no new screen, no new route.
- Q: Spec language (`spec_lang`)? → A: `vi`, inherited from the established F001-F007
  convention.
- Q: Data model change — does `KudosPost` need a new field (e.g. `likedByCurrentUser`)?
  → A: **No type change to `KudosPost`/`kudos-data.ts`.** `hearts` stays the static mock
  "everyone else's" like count exactly as F006 shipped it. "Liked by me" is purely
  client-side UI state (a `Set<string>` of post ids), not part of the post record —
  mirrors the F007 precedent of keeping `kudos-data.ts` a pure static mock module with no
  mutation helpers. Displayed count = `post.hearts + (likedByMe ? 1 : 0)`.
- Q: Where does "liked post ids" state live in the component tree? → A: **`KudosBoard`**
  — it already owns the one piece of cross-section shared state this screen has (the
  hashtag/department filter, FR-15/16/17 from F006) and is the direct parent of both
  consumers of `KudosCard` (`HighlightKudosCarousel`, `AllKudosFeed`). Exactly mirrors
  the existing `onHashtagClick` prop-drilling pattern — no context provider introduced
  (YAGNI, same reasoning F006 used for the filter).
- Q: Persistence mechanism ("giữ trạng thái persist qua reload — mock/local
  persistence")? → A: `localStorage`, key `"saa2025:kudos:liked-post-ids"`, storing a
  JSON array of post ids. Read once on mount via `useEffect` (SSR-safe — initial state is
  empty to avoid hydration mismatch, matches the "hydrate after mount" pattern already
  implicit in this repo's other browser-API-only hooks e.g. `use-scroll-spy.ts`), written
  on every toggle. New posts created by the F007 compose dialog are session-only (lost on
  refresh per F007's own decision) — a like on one of those is naturally lost with it on
  reload too; no special-casing needed since the ids are just strings in a Set.
- Q: "Không cho thích Kudos của chính mình" (can't like your own Kudos) — what counts as
  "your own"? → A: **The post you authored** — `post.sender.name === currentUser.name`
  (`CURRENT_USER` from `kudos-data.ts`, F007). You gave that Kudos; liking your own
  outgoing recognition doesn't make sense in this product's mental model (vs. the
  *recipient* side, which is someone else's incoming recognition and stays likeable).
  Guard implemented as a pure selector `canLikeKudos(post, currentUser)` in
  `kudos-selectors.ts`, mirroring `getDistinctRecipients`'s existing
  `currentUser`-exclusion pattern. When `false`: the heart renders visually disabled
  (`disabled` attribute + reduced opacity, no new visual system) and the click handler
  is not wired (`onToggleLike` omitted at the card call site).
- Q: Anonymous-authored posts (F007 "Gửi ẩn danh" sets `sender = {name: nickname, ...}`,
  not `CURRENT_USER`)? → A: Falls out of the same rule automatically — an anonymous
  post's `sender.name` is the nickname, never `CURRENT_USER.name`, so it is always
  likeable by the current user. No special-casing needed (consistent with F007's own
  decision that anonymous posts need no `KudosCard` changes).
- Q: Optimistic UI + "no double-submit" — does the toggle need a pending/in-flight
  state? → A: **No** — there is no network call (no backend, mock/local only per task
  description). The state update *is* the persistence write (synchronous
  `localStorage.setItem`); "optimistic" here just means the count updates in the same
  render as the click, which a synchronous `useState` toggle already gives for free.
  "No double-submit" is satisfied structurally: a toggle is idempotent-safe by
  construction (each click flips the boolean once; there is no separate "submit" request
  that could race or fire twice).
- Q: Visual treatment for the liked state (task doesn't reference a MoMorph spec for
  this)? → A: Reuse the one existing "active accent" color already in this card
  (`#FFEA9E`, used for hashtag chips/danh hiệu title) for the liked heart fill, rather
  than inventing a new color — smallest possible visual diff, no new design tokens.
- Q: Test coverage for the reversed F006 assertion ("heart count renders as a static
  span, never a button — out of scope") in `kudos-card.test.tsx`? → A: **Update, don't
  delete.** That assertion is the literal, explicit thing this feature now builds. Change
  it to assert the span-fallback only applies when `onToggleLike` is omitted (backward
  compatible default, mirrors the existing optional `composerTriggerProps`/
  `onHashtagClick` pattern elsewhere in this card/banner), and add new assertions for the
  button/toggle/disabled-when-own-post behavior.

## Session 2026-07-07, continued — concurrent-run reconciliation

- Q: Mid-implementation, `kudos-card.tsx`/`kudos-board.tsx`/`all-kudos-feed.tsx`/
  `highlight-kudos-carousel.tsx`/`kudos-page-client.tsx` were repeatedly overwritten by an
  external process not spawned by this session. What happened? → A: A second, overlapping
  takumi run for the identical feature request was in flight against the same working
  tree at the same time (root cause: an ambiguous "continue" resume instruction upstream
  misread as a fresh invocation). It produced its own plan,
  `plans/260707-0010-kudos-like-heart-toggle/`, and independently implemented the same
  heart-toggle behavior, repeatedly landing its own versions of the shared files. Multiple
  live overwrites were observed (files reverting mid-verification after passing tests
  moments earlier).
- Q: Which implementation shipped? → A: **A merge, not a pure win for either side.** The
  other run's `kudos-card.tsx` design (inline heart button inside the card, `<button
  aria-pressed aria-label>` using new `KudosCardLabels.like`/`unlike` i18n strings) is what
  is on disk and is functionally equivalent to — arguably a modest a11y improvement over —
  this plan's originally-authored `kudos-like-button.tsx` extraction (which no longer
  exists; superseded). `kudos-board.tsx`/`all-kudos-feed.tsx`/`highlight-kudos-carousel.tsx`
  likewise ship the other run's `likedIds: Set<string>` prop-drilling shape rather than this
  plan's `isLiked`/`canLike` accessor-function shape. Both shapes satisfy the same FRs;
  re-fighting a file that a live external process keeps re-writing was judged lower-value
  than converging on whichever correct version was already stable.
- Q: Was anything actually wrong with the other run's design that needed fixing before
  shipping? → A: **Yes, one real gap.** `plans/260707-0010-kudos-like-heart-toggle/plan.md`
  explicitly scoped out reload-persistence ("Out of scope: Persistence beyond session (no
  localStorage / backend)") and its `KudosPageClient` used a plain `useState<Set<string>>`
  for `likedIds` — session-only, lost on refresh. That directly contradicts this task's
  explicit requirement ("giữ trạng thái persist qua reload — mock/local persistence").
  Fixed by keeping this plan's `hooks/use-kudos-likes.ts` (localStorage-backed, SSR-safe)
  and wiring it into `KudosPageClient` in place of the plain `useState`. This is the one
  substantive, requirements-driven reason this plan (`260707-0008`) was kept canonical
  rather than the other one.
- Q: Canonical plan going forward? → A: `plans/260707-0008-kudos-like-toggle/` (this one).
  `plans/260707-0010-kudos-like-heart-toggle/` is marked `SUPERSEDED.md` pointing back here.
- Q: Any other defect found during reconciliation? → A: `hooks/use-kudos-likes.ts`'s mount
  effect tripped `react-hooks/set-state-in-effect` (a real `npm run lint` error, not a
  false positive) — synchronous `setState` in an effect body with no external-subscription
  callback to move it into (unlike `use-scroll-spy.ts`'s `IntersectionObserver` callback).
  Fixed with a targeted, commented `eslint-disable-next-line` on that one line — this is
  the one legitimate use of the pattern the rule guards against (hydrating from a
  browser-only API on mount without causing a hydration mismatch). Also fixed a now-stale
  doc comment on `KudosPost.hearts` in `kudos-types.ts` ("heart toggle is out of scope")
  left over from F006.
- Unresolved for human review: the other run's design choices beyond persistence (inline
  heart-in-card vs. an extracted `KudosLikeButton`, `likedIds` Set-prop-drilling vs.
  accessor-function-prop-drilling, the new `KudosCardLabels.like`/`unlike` i18n surface)
  were accepted as-is rather than reverted to this plan's originally-authored versions,
  since they are equally correct and reverting a stable, tested, green implementation
  back to an untested alternate shape carried more regression risk than value. Flag if a
  future reviewer prefers the extracted-component shape.

## Session 2026-07-07 (doc-drift correction, found during cross-screen QA audit)

- Q: Does the shipped code still match the reconciliation note above (`hooks/use-kudos-likes.ts`,
  localStorage-backed persistence kept canonical)? → A: **No.** `hooks/use-kudos-likes.ts` does not
  exist in the current codebase; `KudosPageClient` owns `likedIds` via a plain session-only
  `useState<Set<string>>`, matching `docs/features/f008-like-kudos/feature.md` §4 exactly (which
  explicitly states "session-only ... không có localStorage/backend"). The reconciliation note two
  sections above is stale relative to what actually shipped.
- Q: Why the discrepancy? → A: Unknown — no record of a later decision to drop the localStorage hook
  was found in this plan dir or the journal. Flagging rather than guessing; feature.md's session-only
  description is being treated as the source of truth since it matches the running code, but a human
  should confirm reload-persistence was intentionally dropped (not silently regressed) before this
  gap is considered resolved.
