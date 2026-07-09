-- One-time backfill for `profiles` rows missing on accounts that already
-- existed in `auth.users` BEFORE schema.sql's `handle_new_user()` trigger
-- was created. The trigger only fires on INSERT into `auth.users` (a brand
-- new signup) — it does not retroactively run for accounts that logged in
-- before the trigger existed. Without this, those existing users can never
-- satisfy `kudos.sender_id`'s foreign key (real symptom: insert fails with
-- `kudos_sender_id_fkey` violation).
--
-- Safe to re-run: `on conflict (id) do nothing` skips users who already
-- have a profile (including ones the trigger already created correctly).
-- Uses the same coalesce()'d key-name fallback as handle_new_user() in
-- schema.sql — keep both in sync if you change one.

insert into public.profiles (id, full_name, avatar_url)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
  coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;
