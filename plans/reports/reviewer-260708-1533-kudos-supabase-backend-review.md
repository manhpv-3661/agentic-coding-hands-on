# Review: Kudos → Supabase backend pivot (F006/F007/F008)

Scope: supabase/schema.sql, supabase/README.md, lib/kudos/{kudos-db-types,kudos-row-mapper,
kudos-repository}.ts + tests, lib/kudos/kudos-action-types.ts, app/kudos/actions.ts + test,
app/kudos/page.tsx, app/components/kudos/kudos-page-client.tsx,
app/components/kudos/compose/{compose-dialog,compose-form-helpers}.tsx + tests, i18n
failureToast keys, docs (architecture.md, project-changelog.md, f006/f007/f008 feature.md).
Verified: `tsc --noEmit` clean, `eslint` clean on changed files, kudos-scoped vitest (36 files /
257 tests) all pass.

## Critical
None found.

## High Priority

**H1 — No server-side bound/length validation on `createKudosAction` inputs.**
`app/kudos/actions.ts:44-58` inserts `title`, `content`, `hashtags`, `image_count`,
`recipient_name`, `recipient_department`, `anonymous_name` straight from `CreateKudosInput`
into Postgres. All limits (content maxLength=1000 in `rich-text-editor.tsx`, hashtag/image
count caps) live client-side only. `schema.sql` has zero `CHECK` constraints. Server Actions
are directly-invocable public POST endpoints (the code's own comments acknowledge this for the
self-like check in `toggleLikeAction`), so a logged-in user can call `createKudosAction`
directly with an arbitrarily large `content`/`hashtags` array or a negative/huge `imageCount`,
bypassing every client cap. Failure scenario: authenticated user scripts direct calls with
multi-MB `content` strings or thousands of hashtag entries → storage bloat / degraded feed
queries, with nothing between the client and the DB to stop it.
Fix: validate length/array-size bounds inside `createKudosAction` (mirroring the existing
`validateComposeForm` rules) and/or add `CHECK` constraints in `schema.sql`.

**H2 — Optimistic-UI toast contradiction on a real compose failure.**
`compose-dialog.tsx:154-178` (`handleSubmit`) calls `onSubmit(state)` fire-and-forget, closes
the dialog, and unconditionally shows a "success" toast (`Đã gửi Kudos!`) via
`setToast(true)` — before `createKudosAction`'s actual result is known (confirmed by
`compose-dialog.test.tsx:131-150`, which asserts the toast fires synchronously off submit).
Meanwhile `kudos-page-client.tsx:97-105` awaits the real result and, on `{ok:false}`, rolls
back the optimistic post and shows a *second*, contradicting toast
(`labels.compose.failureToast`, "Gửi Kudos thất bại..."). Both toasts share byte-identical
positioning classes (`fixed bottom-6 left-1/2 z-60 -translate-x-1/2 ...` — compare
`compose-dialog.tsx:229-234` and `kudos-page-client.tsx:214-220`). On any real backend failure
(RLS violation, network blip, DB error) the user sees "Kudos sent!" immediately, then the post
vanishes from the feed and a "failed to send" toast appears at the same screen position shortly
after — actively misleading, and no test asserts these two toasts don't coexist.
Fix: don't fire the success toast from `ComposeDialog` until `addPost`'s promise resolves
`ok:true` (move ownership of the success toast to `KudosPageClient`, same place the failure
toast already lives), or suppress/replace it on failure.

## Medium Priority

**M1 — No pending-guard on the like-toggle button; double-click race window is real, not just theoretical.**
`kudos-card.tsx:148-154` disables the heart button only for `isOwnPost`, never while a toggle
request for that post is in flight (contrast with `ComposeDialog`'s own `isSubmittingRef`
double-submit guard). Traced the race: two rapid clicks each capture `wasLiked` from
`likedIds` at render time; because `toggleLike` is a `useCallback` keyed on `likedIds`
(`kudos-page-client.tsx:121-174`), *sequential* double-clicks (separate click events, React
re-renders between them) resolve correctly. But the two in-flight server requests can still
complete in an order that doesn't match the order their HTTP responses arrive at the client —
`toggleLikeAction`'s check-then-act (select → insert/delete) has no transaction wrapping the
pair, so under network reordering the last-applied `setLikedIds` (whichever response resolves
last on the client) can diverge from whichever DB operation actually committed last. This is
an accepted trade-off per `clarifications.md` ("no RPC function, YAGNI") but nothing in the
implementation narrows the window — recommend disabling the heart button while its own toggle
is pending, same pattern already used for compose.

## Verified Correct (explicitly checked, no issues found)

- **RLS with check on every INSERT policy**: `kudos_posts_insert_own` and
  `kudos_likes_insert_own` both use `with check (... = (select auth.uid()))`
  (`schema.sql:113-117, 129-133`) — INSERT policies in Postgres only support `WITH CHECK`
  (there's no `USING` for INSERT), so this is the only correct form and it's used correctly.
- **`kudos_posts` immutability**: confirmed zero UPDATE/DELETE policies exist for
  `kudos_posts` in `schema.sql`; `kudos_likes` correctly *does* have `kudos_likes_delete_own`
  for the unlike path. `supabase/README.md`'s verification checklist (§3) matches.
- **`handle_new_user()` can never block Google signup**: wrapped in
  `exception when others then null` (`schema.sql:166-170`) — any failure (e.g. OAuth metadata
  key mismatch, flagged as an open verification item in the README) degrades to a
  `null`-fielded profile row rather than aborting the `auth.users` insert transaction.
- **`sender_id`/`user_id` are never taken from client input**: read both actions line by
  line — `createKudosAction` uses `user.id` from `supabase.auth.getUser()` for `sender_id`
  (`actions.ts:49`), `toggleLikeAction` uses it for `user_id` (`actions.ts:156`). Neither
  reads an id off `input`/`postId`'s caller-supplied shape for identity. Confirmed by
  `actions.test.ts:88-106` ("never client input"). Self-like additionally blocked server-side
  (`actions.ts:116-118`), tested independently of the client's `canLikeKudos` gate.
- **Double-count math (Phase 05's core deliverable)**: re-derived independently from
  `kudos-repository.ts:37-79`. `rawLikeCount` = total likes on the post; when the current
  user is in `likedByCurrentUser`, server subtracts 1 (`Math.max(0, rawLikeCount - 1)`) before
  the client re-adds its own optimistic `+1` — net equals the true total in all three cases:
  liked (server N-1, client +1 → N), not-liked (server N, client +0 → N), unauthenticated
  (server N, no client overlay possible since `getLikedPostIds` returns `[]` for `null`
  userId → N). Matches `kudos-repository.test.ts`'s three dedicated cases exactly.
- **Mock-fallback completeness**: every repository export (`getKudosPosts`,
  `getLikedPostIds`, `getCurrentKudosPerson`) and every Server Action (`createKudosAction`,
  `toggleLikeAction`) checks `isSupabaseConfigured()` first with a mock-identical return path
  — no partial branches. `requireUser()`/`getOptionalUser()` (`lib/auth/require-user.ts`)
  return `null` rather than redirecting when unconfigured, preserving the authless e2e path
  end to end.
- **`KudosPost`/`KudosPerson` contract stability**: `lib/kudos/kudos-types.ts` is untouched
  by this pivot (not in the changed-file set) — confirmed by reading it directly; all
  adaptation happens at `kudos-row-mapper.ts`.
- **RLS is actually enforced, not bypassed**: `lib/supabase/server.ts` uses
  `createServerClient` from `@supabase/ssr` with the anon key + request cookies, never a
  service-role key — queries run as the requesting user, so RLS is the real gate, not
  decorative.
- **No stored XSS**: `rich-text-editor.tsx` persists `el.textContent` only, never
  `innerHTML`; `kudos-card.tsx` renders `post.content`/`post.title` via plain JSX
  interpolation (React-escaped), never `dangerouslySetInnerHTML`.
- **No PII/data leak**: `getKudosPosts`/`getCurrentKudosPerson` select only
  `display_name, department, stars` from `profiles` — never email or other `auth.users`
  fields.
- **Docs accuracy**: `docs/system/architecture.md` and the three feature docs were spot
  checked against the actual code — they correctly flag prior "no backend" claims as
  superseded (not silently rewritten), and honestly state the schema has **not** been run
  against production yet (`isSupabaseConfigured()` gate makes this safe either way).

## Low Priority / Suggestions

- **Dead export**: `KudosLikeRow` (`lib/kudos/kudos-db-types.ts:40-45`) is never imported
  anywhere outside its own definition. `ProfileRow` is only consumed internally in the same
  file (`Pick<ProfileRow, ...>`). Harmless (types-only) but cruft — either use them at a call
  site or drop them.
- **File size**: `kudos-page-client.tsx` grew from 112 → 224 lines in this pivot (net +112),
  crossing the repo's 200-line-per-file guideline. The optimistic `addPost`/`toggleLike` logic
  (roughly lines 89-174) is self-contained enough to extract into a hook
  (e.g. `use-kudos-optimistic-posts.ts` / `use-kudos-optimistic-likes.ts`), which would also
  make M1's pending-state fix easier to land. `compose-dialog.tsx` (238 lines) was already
  over the cap pre-pivot (234→238) — not newly introduced, not blocking.
- `image_count`/`imageCount` and other numeric inputs have no explicit `>= 0` guard on the
  server before insert (ties to H1) — worth bundling into the same validation pass.

## Unresolved Questions
- None blocking. Q6 from `clarifications.md` (verify real OAuth `raw_user_meta_data` key
  names before/after running `schema.sql`) is explicitly called out as a manual, pre-deploy
  step in `supabase/README.md` — not something static review can confirm without a live
  Supabase project.

**Status:** DONE_WITH_CONCERNS
**Summary:** No critical bugs; RLS, self-like, double-count math, and mock-fallback
completeness all verified correct by direct code tracing (not just trusting tests). Two High
findings need a decision before this ships to real users: missing server-side input bounds on
`createKudosAction`, and a genuine contradictory-toast bug in the optimistic compose flow on
failure. One Medium (like-toggle double-click race window, already an accepted design
trade-off but worth tightening) and minor cleanup items.
