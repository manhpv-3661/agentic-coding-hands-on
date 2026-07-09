# Phase 02 — Data-Access Repository (reads)

## Context Links
- Depends on: Phase 01 (schema shape)
- Existing: `lib/supabase/server.ts`, `lib/supabase/env.ts` (`isSupabaseConfigured`)
- Contract to preserve: `lib/kudos/kudos-types.ts` (`KudosPost`, `KudosPerson`)
- Consumers unchanged: `lib/kudos/kudos-selectors.ts`, all `app/components/kudos/*`

## Overview
- **Priority:** P1
- **Status:** pending
- **Description:** New server-only module that returns the same
  `KudosPost[]` shape the page already consumes — from Postgres when
  configured, from the static mock otherwise. This is the keystone that
  keeps the authless e2e green and the view layer untouched.

## Key Insights
- Adapt DB rows → `KudosPost` at THIS boundary only. Selectors/cards/board
  keep operating on `KudosPost` with zero shape change (DRY/KISS).
- Like count read via `COUNT()` join (no trigger). Total hearts =
  `base_hearts + like_count`.

## Requirements
- `getKudosPosts(): Promise<KudosPost[]>` — feed order (created_at desc),
  hearts computed, sender mapped (anonymous → nickname), recipient from
  snapshot fields.
- `getLikedPostIds(userId): Promise<string[]>` — current user's like rows
  (empty in mock mode / when unauthenticated).
- `getCurrentKudosPerson(user): Promise<KudosPerson>` — maps the auth user +
  profile to the `KudosPerson` the compose form needs as `sender`
  (replaces the `CURRENT_USER` mock constant; mock mode returns `CURRENT_USER`).
- All functions fall back to `lib/kudos/kudos-data.ts` when
  `!isSupabaseConfigured()`.

## Architecture — data flow
```
app/kudos/page.tsx (Server Component)
  └─ kudos-repository.getKudosPosts()
       ├─ !isSupabaseConfigured()  → return KUDOS_POSTS (mock)
       └─ configured → supabase.from('kudos_posts')
             .select('*, kudos_likes(count)')  → map rows → KudosPost[]
```
Row → `KudosPost` mapping table:
| DB column | KudosPost field |
|---|---|
| `id` | `id` |
| profile.display_name / anonymous_name | `sender.name` |
| profile.department / '' | `sender.department` |
| profile.stars / 0 | `sender.stars` |
| `recipient_name` / `recipient_department` | `recipient.name` / `.department` (stars 0) |
| `created_at` | `timestamp` (via `formatKudosTimestamp`) |
| `title`, `content`, `hashtags`, `image_count` | same |
| `base_hearts + count(kudos_likes)` | `hearts` |
| `is_anonymous` | `anonymous` |
| `sender_id === auth.uid()` | `sentByCurrentUser` |

## Related Code Files
- **Create:** `lib/kudos/kudos-repository.ts` (server-only; may need
  splitting if >200 lines — extract row-mapper to `kudos-row-mapper.ts`).
- **Create:** `lib/kudos/kudos-db-types.ts` (DB row interfaces).
- **Read:** `lib/supabase/server.ts`, `lib/kudos/kudos-data.ts`,
  `lib/kudos/kudos-types.ts`, `lib/kudos/format-kudos-timestamp.ts`.
- No changes to selectors/components in this phase.

## Implementation Steps
1. Define DB row types in `kudos-db-types.ts`.
2. Write pure `mapRowToKudosPost(row, currentUserId)` (unit-testable, no I/O).
3. `getKudosPosts` / `getLikedPostIds` / `getCurrentKudosPerson` with the
   `isSupabaseConfigured()` branch; use `await createClient()`.
4. Handle query errors: log + fall back to mock (never crash the page —
   matches repo's graceful-degradation rule in `docs/system/architecture.md`).

## Todo List
- [ ] `kudos-db-types.ts`
- [ ] pure `mapRowToKudosPost`
- [ ] `getKudosPosts` (branch + query + map)
- [ ] `getLikedPostIds`
- [ ] `getCurrentKudosPerson`
- [ ] error → mock fallback

## Success Criteria
- Mock mode: identical `KudosPost[]` to today (byte-for-byte view parity).
- Configured mode: rows render through unchanged cards/board.
- `mapRowToKudosPost` unit-tested (anonymous, self-authored, hearts sum).

## Risk Assessment
- **[Med] Query shape for `kudos_likes(count)`** — confirm the `@supabase/
  supabase-js` embedded-count syntax returns the expected shape; unit-test
  the mapper against a captured sample row.
- **[Low] N+1 on likes** — single embedded count avoids it; index present.

## Security Considerations
- Server-only module (never imported by a client component). RLS still the
  authoritative gate; this layer trusts RLS for row visibility.

## Next Steps
Unblocks Phase 03 (actions reuse the mapper/types) and Phase 04 (page wires
`getKudosPosts`/`getLikedPostIds`/`getCurrentKudosPerson`).
