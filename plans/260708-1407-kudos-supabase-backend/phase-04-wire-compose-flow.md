# Phase 04 — Wire Compose → Backend

## Context Links
- Depends on: Phase 02 (repository), Phase 03 (`createKudosAction`)
- **File-ownership caution:** `app/kudos/page.tsx` + `kudos-page-client.tsx`
  may also be touched by `plans/260707-2337-site-layout-system-audit-fixes/`.
  Do not start until that plan's kudos work lands (see plan.md).
- Current flow: `compose-dialog.tsx:168` builds a `KudosPost` client-side
  via `buildKudosPost` and calls `onSubmit`; `kudos-page-client.tsx`
  prepends to `useState` posts.

## Overview
- **Priority:** P1
- **Status:** pending
- **Description:** Replace the in-memory prepend with a `createKudosAction`
  call, keeping an optimistic prepend for instant feedback. `page.tsx`
  sources posts/currentUser from the repository instead of the mock consts.

## Key Insights
- Keep `KudosPageClient` prop-driven and its `onSubmit`/optimistic prepend so
  unit tests can still inject a mock action (testability preserved).
- `buildKudosPost` stays as the OPTIMISTIC client-side view-model builder;
  the serializable action input is derived from `ComposeFormState` in
  parallel. Do not delete `buildKudosPost` — it feeds optimistic UI + keeps
  mock mode behaving exactly as today.
- After a successful action, `revalidatePath('/kudos')` (Phase 03) refreshes
  server data; the optimistic post is reconciled by the re-render.

## Requirements
- `page.tsx`: `getKudosPosts()`, `getCurrentKudosPerson(user)`,
  `getLikedPostIds(user.id)` replace `KUDOS_POSTS`/`CURRENT_USER`/(likes).
  Recipient options: derive from posts as today (`getDistinctRecipients`) —
  free-text recipient model needs no directory (see open-Q).
- `kudos-page-client.tsx`: `addPost` becomes: optimistic prepend →
  `await createKudosAction(input)` → on error, roll back the optimistic post
  + surface the existing toast; on `skipped` (mock mode) keep prepend only.
- Pass a serializable submit handler down through `ComposeDialog`.

## Architecture — data flow
```
page.tsx (server): posts+currentUser+likedIds from repository → props
  → KudosPageClient (client, optimistic posts state seeded from initialPosts)
      → ComposeDialog.onSubmit(formState)
          → optimistic prepend (buildKudosPost) + createKudosAction(input)
          → ok: revalidate re-render replaces optimistic
          → error: rollback + toast ; skipped(mock): keep optimistic
```

## Related Code Files
- **Modify:** `app/kudos/page.tsx` (repository reads),
  `app/components/kudos/kudos-page-client.tsx` (action wiring, rollback),
  `app/components/kudos/compose/compose-dialog.tsx` (pass form state up /
  call action; keep `buildKudosPost` for optimistic view-model).
- **Read:** `app/kudos/actions.ts`, `lib/kudos/kudos-repository.ts`.
- **Possibly:** `compose-form-helpers.ts` — add `toCreateKudosInput(state)`.

## Implementation Steps
1. `page.tsx`: swap mock consts for repository calls (keep `requireUser()`).
2. Add `toCreateKudosInput(state, currentUser)` mapper (serializable).
3. `kudos-page-client.tsx`: make `addPost` async — optimistic prepend, call
   action, rollback on `{ok:false}`, keep-only on `{skipped:true}`.
4. Keep the success toast (`copy-link-button`-style) wiring intact.

## Todo List
- [ ] `page.tsx` repository reads
- [ ] `toCreateKudosInput` mapper
- [ ] async `addPost` with optimistic + rollback
- [ ] compose-dialog passes serializable input up
- [ ] mock-mode (skipped) keeps current behavior

## Success Criteria
- Configured: a submitted Kudos persists (survives reload).
- Mock/authless: behaves exactly as today (session-only prepend).
- Error path: optimistic post rolled back, user sees a failure toast.

## Risk Assessment
- **[High] Concurrent edit with layout-system plan** on `page.tsx`/
  `kudos-page-client.tsx` — sequence after it; do not parallelize.
- **[Med] Optimistic id vs real id mismatch** — `buildKudosPost` id is
  temporary; the revalidate re-render supplies the real row → dedupe by not
  keying long-term on the optimistic id (drop optimistic on refresh).
- **[Med] Anonymous mapping** — `is_anonymous`/`anonymous_name` carried
  through the input; verify card shows nickname, not real identity.

## Rollback
Revert the three files to mock-prepend; `createKudosAction` unused is inert.
Feature-flag not needed — mock fallback IS the safe state.

## Security Considerations
`sender_id` set server-side from `auth.uid()`; client input never sets it.

## Next Steps
Sequential predecessor of Phase 05 (same two files). Then Phase 07 updates
`kudos-page-client.test.tsx` / `compose-dialog.test.tsx`.
