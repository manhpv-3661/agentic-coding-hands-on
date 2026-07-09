# Phase 01 — Schema + RLS + Seed SQL

## Context Links
- Research: `plans/reports/` (Supabase RLS + Next.js patterns; folded in below)
- Existing auth: `lib/supabase/server.ts`, `lib/auth/require-user.ts`, `app/auth/callback/route.ts`
- Mock source of truth to migrate: `lib/kudos/kudos-data.ts`

## Overview
- **Priority:** P1 (blocks everything)
- **Status:** pending
- **Description:** Author one checked-in `supabase/schema.sql` (source of
  truth), run once via the Supabase Dashboard SQL editor. No CLI migration
  workflow (KISS — repo has zero `supabase/` dir; adopting the CLI half-way
  creates the exact "SQL editor desyncs migration history" failure mode the
  docs warn about). **No `seed.sql`** — round-2 clarification decided the 12
  existing mock posts stay in `kudos-data.ts` (served via the mock fallback);
  only posts created from now on via the real compose flow write to Postgres.

## Key Insights (from research)
- `INSERT` policies evaluate **`WITH CHECK` only** — `USING` is ignored;
  omitting `WITH CHECK` is the classic "insert as someone else" footgun.
- Wrap `auth.uid()` as `(select auth.uid())` — cached as InitPlan (perf).
- Like count via **`COUNT()`**, NOT a trigger (YAGNI at hundreds of posts).
  To preserve the mock highlight-ordering, keep a `base_hearts` baseline
  column: display hearts = `base_hearts + count(kudos_likes)`. Mirrors the
  existing mental model (`hearts` = "everyone else's" static count, real
  like rows add on top — same as today's `post.hearts + (likedByMe?1:0)`).
- `profiles` auto-created by an `on auth.user created` trigger; function
  MUST be `security definer set search_path = ''` and trivial/NULL-tolerant
  (a throw rolls back the whole signup).

## Requirements
- Three tables under `public`: `profiles`, `kudos_posts`, `kudos_likes`.
- RLS on all three; all reads open to `authenticated`; writes self-only.
- `UNIQUE(user_id, post_id)` on likes → idempotent toggle backstop.
- Index `kudos_likes(post_id)` (count perf) and `kudos_posts(created_at desc)`
  (feed order). GIN index on `kudos_posts.hashtags` (filter).
- No seed data — table starts empty; `kudos-data.ts` mock stays as the
  fallback/legacy content (round-2 decision).

## Architecture — schema (recommended, pending open-Q confirmation)
```sql
-- profiles: extends auth.users; department/stars admin-seeded (no OAuth source)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  department text,               -- nullable; admin-seeded
  stars integer not null default 0,
  updated_at timestamptz not null default now()
);

-- kudos_posts: sender = real auth user; recipient = free-text snapshot
create table public.kudos_posts (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_name text not null,
  recipient_department text not null default '',
  title text,                    -- "danh hiệu", optional
  content text not null,
  hashtags text[] not null default '{}',
  image_count integer not null default 0,   -- no real image storage (YAGNI)
  base_hearts integer not null default 0,   -- baseline for seeded/legacy rows
  is_anonymous boolean not null default false,
  anonymous_name text,           -- shown instead of sender when is_anonymous
  created_at timestamptz not null default now()
);

-- kudos_likes: join, unique per (user,post)
create table public.kudos_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.kudos_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);
```
RLS: `profiles` select-all / update-own; `kudos_posts` select-all /
insert-own (`with check sender_id = (select auth.uid())`) —
**fully immutable: no update policy, no delete policy** (round-2 decision,
tighter than delete-by-author); `kudos_likes` select-all / insert-own /
delete-own (unlike still allowed). `handle_new_user()` trigger per research.

## Data flow
Signup (Google OAuth) → `auth.users` insert → trigger → `profiles` row
(display_name/avatar from `raw_user_meta_data`; department/stars NULL/0).
Reads/writes later gate on `auth.uid()` = the profile id.

## Related Code Files
- **Create:** `supabase/schema.sql`, `supabase/seed.sql`,
  `supabase/README.md` (how to run in Dashboard, ordering).
- **Read for mapping:** `lib/kudos/kudos-data.ts`, `lib/kudos/kudos-types.ts`.
- No app code changes in this phase.

## Implementation Steps
1. Inspect one real signed-in user's `auth.users.raw_user_meta_data` in the
   Dashboard → confirm exact key names (`full_name` / `name`, `avatar_url` /
   `picture`) before finalizing `handle_new_user()`.
2. Write `schema.sql`: tables → indexes → `enable row level security` →
   policies → `handle_new_user()` + `on_auth_user_created` trigger.
3. Write `seed.sql`: insert `kudos_posts` from the 12 mock posts. Sender
   needs a real `profiles.id` — see open-Q; interim: seed under a designated
   admin/service profile id, `base_hearts` = mock `hearts`, map
   anonymous→`is_anonymous`+`anonymous_name`.
4. Run `schema.sql` then `seed.sql` in the Dashboard SQL editor.
5. Verify: RLS on (each table `rowsecurity = true`), a non-owner cannot
   insert a post as another `sender_id`, unique-violation on duplicate like.

## Todo List
- [ ] Confirm `raw_user_meta_data` keys from a live row
- [ ] `schema.sql` (tables/indexes/RLS/trigger)
- [ ] `seed.sql` (12 posts from mock)
- [ ] `supabase/README.md` run instructions
- [ ] Run + verify RLS and unique constraint in Dashboard

## Success Criteria
- All three tables exist with RLS enabled; policies match the matrix above.
- Seed posts queryable; highlight-ordering (`base_hearts`) reproduces the
  current top-5 order.
- Inserting a like twice for same (user,post) raises `23505`.

## Risk Assessment
- **[High] `department`/`stars` have no OAuth source** → sender cards show
  empty dept / 0 stars for real users. Mitigation: `base_hearts`/seed under
  admin profile for demo; admin-seed real profiles. Blocking open-Q.
- **[Med] Trigger throw blocks signup** → keep function trivial, NULL-tolerant,
  `security definer search_path=''`. Test with a fresh Google login.
- **[Med] Seed needs a real sender profile id** (FK) but profiles only exist
  post-login → seed under an admin id, or drop the FK-NOT-NULL for seed rows.
  Resolve with recipient/identity open-Q.
- **[Low] Free-text recipient loses recipient `stars`** shown on card → 0.

## Security Considerations
- RLS is the datastore gate; Server Actions (Phase 03) re-check `auth.uid()`
  as defense-in-depth. No service_role key in client/`NEXT_PUBLIC_*`.
- `search_path=''` on the definer function (injection hardening).

## Next Steps
Unblocks Phase 02 (repository maps these rows → `KudosPost`) and Phase 06
(profiles identity). Confirm open questions in `clarifications.md` first.
