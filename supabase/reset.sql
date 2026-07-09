-- Full reset for the SAA 2025 mock-project Supabase objects.
--
-- Run this if you want to wipe the current app schema/data and start again.

begin;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop table if exists public.kudos_likes cascade;
drop table if exists public.gift_logs cascade;
drop table if exists public.kudos cascade;
drop table if exists public.profiles cascade;

delete from storage.objects
where bucket_id = 'kudos-images';

delete from storage.buckets
where id = 'kudos-images';

commit;
