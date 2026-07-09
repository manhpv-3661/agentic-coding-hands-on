-- Repair permissions for an EXISTING Supabase project that already has the
-- SAA tables but was created without GRANT statements.
--
-- Symptom this fixes:
-- - data exists in Supabase SQL editor
-- - web app still shows empty Kudos / gifts
-- - PostgREST errors like:
--     permission denied for table kudos
--     permission denied for table gift_logs
--
-- Safe to run multiple times.

begin;

grant usage on schema public to authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.kudos to authenticated;
grant select, insert, delete on public.kudos_likes to authenticated;
grant select, insert on public.gift_logs to authenticated;

grant usage, select on all sequences in schema public to authenticated;

commit;
