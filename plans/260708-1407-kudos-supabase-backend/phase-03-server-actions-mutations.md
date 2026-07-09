# Phase 03 — Server Actions (mutations)

## Context Links
- Depends on: Phase 01 (tables/RLS), Phase 02 (types/mapper, `createClient`)
- Research: Server Actions idiomatic for UI-triggered mutations; re-check
  `auth.uid()` inside every action (public POST endpoints); `revalidate`
  BEFORE any `redirect`; toggle = server check-then-act + UNIQUE backstop.

## Overview
- **Priority:** P1
- **Status:** pending
- **Description:** Two `'use server'` actions in `app/kudos/actions.ts` —
  `createKudosAction` and `toggleLikeAction`. Both no-op gracefully when
  `!isSupabaseConfigured()` so mock/authless mode is unaffected.

## Key Insights
- Idempotent toggle: `select` existing like → `delete` if present else
  `insert`; catch `23505` unique-violation → treat as already-liked (no-op
  success). No RPC function (YAGNI).
- Self-like block enforced server-side too (defense-in-depth): reject when
  the post's `sender_id === auth.uid()`; client already hides the button via
  `canLikeKudos`.
- `revalidatePath('/kudos')` after a successful mutation. (Research notes a
  new `refresh()` from `next/cache` in this Next build; prefer the
  well-established `revalidatePath` — lower risk on a custom Next fork.)

## Requirements
- `createKudosAction(input)`: validate auth; insert `kudos_posts` with
  `sender_id = auth.uid()`, mapped fields (title/content/hashtags/
  image_count/is_anonymous/anonymous_name, recipient snapshot); revalidate;
  return `{ ok, postId }` or `{ ok:false, error }`.
- `toggleLikeAction(postId)`: validate auth; block self-like; check-then-act
  insert/delete; revalidate; return `{ ok, liked }`.
- Both: `if (!isSupabaseConfigured()) return { ok:true, skipped:true }` so
  the client's optimistic state stands alone in mock mode.
- Input types shared with the compose form (`ComposeFormState` maps to the
  action input; keep the action input serializable — pass primitives, not
  `File[]`, only `imageCount`).

## Architecture — data flow
```
ComposeDialog submit → createKudosAction(serializable input)
  → auth check → insert → revalidatePath('/kudos') → return {ok, postId}
KudosCard like click → optimistic toggle (client) → toggleLikeAction(postId)
  → auth + self-like check → delete|insert (catch 23505) → revalidate → {ok,liked}
```

## Related Code Files
- **Create:** `app/kudos/actions.ts` (`'use server'`).
- **Create:** `lib/kudos/kudos-action-types.ts` (serializable input/result).
- **Read:** `lib/supabase/server.ts`, `lib/kudos/kudos-repository.ts`,
  `app/components/kudos/compose/compose-form-helpers.ts` (field shape).
- No component edits here (wiring is Phase 04/05).

## Implementation Steps
1. Define serializable `CreateKudosInput` / action result types.
2. `createKudosAction`: `await createClient()`, `getUser()`, guard null →
   error; insert; `revalidatePath('/kudos')`; return.
3. `toggleLikeAction`: fetch post's `sender_id`; reject self-like; select
   existing like; delete or insert (try/catch `23505`); revalidate; return.
4. Wrap DB calls in try/catch → typed error result (never throw to client).

## Todo List
- [ ] action input/result types
- [ ] `createKudosAction` (+ auth guard, revalidate)
- [ ] `toggleLikeAction` (+ self-like guard, 23505 handling)
- [ ] mock-mode no-op branch on both
- [ ] error paths return typed result

## Success Criteria
- Authenticated insert creates a row visible on next render; unauth →
  rejected result (no row).
- Double-like same post is a stable no-op (count doesn't double).
- Mock mode: actions return `skipped:true`, no DB touched, UI unchanged.

## Risk Assessment
- **[High] Server Actions are public POST endpoints** — MUST re-check auth +
  ownership inside; do not rely on RLS alone (clean 401/403 path).
- **[Med] Optimistic/real divergence** — action returns authoritative
  `liked`; client reconciles on error (Phase 05).
- **[Med] `revalidatePath` on a custom Next fork** — verify it re-renders
  the feed; fallback `router.refresh()` client-side if needed.

## Security Considerations
- `sender_id`/`user_id` always taken from `auth.uid()`, never from client
  input (prevents spoofing even if RLS misconfigured).
- Self-like rejection server-side.

## Next Steps
Unblocks Phase 04 (compose wires `createKudosAction`) and Phase 05 (like
wires `toggleLikeAction`).
