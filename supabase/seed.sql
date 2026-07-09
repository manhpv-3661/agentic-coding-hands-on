-- Temporary seed data for manual QA on Supabase.
--
-- Usage:
-- 1. Run `schema.sql`
-- 2. Ensure at least 2 real users have logged in once, OR run
--    `backfill-existing-users-profiles.sql` after users already exist in
--    `auth.users`
-- 3. Run this file
--
-- Behavior:
-- - idempotent: safe to re-run
-- - uses ALL existing `profiles` rows (not just the first few)
-- - every profile gets demo sent/received/like/gift activity so the logged-in
--   user is much less likely to see all-zero sidebar stats
-- - fails loudly if fewer than 2 profiles exist

begin;

do $$
declare
  total_profiles integer;
begin
  select count(*) into total_profiles from public.profiles;

  if total_profiles < 2 then
    raise exception
      'seed.sql requires at least 2 rows in public.profiles. Current count: %',
      total_profiles;
  end if;
end
$$;

with ordered_profiles as (
  select
    id,
    coalesce(full_name, 'Sunner') as full_name,
    row_number() over (order by id) as rn,
    count(*) over () as total_profiles
  from public.profiles
),
generated_kudos as (
  select
    (
      substr(seed_hash, 1, 8) || '-' ||
      substr(seed_hash, 9, 4) || '-' ||
      substr(seed_hash, 13, 4) || '-' ||
      substr(seed_hash, 17, 4) || '-' ||
      substr(seed_hash, 21, 12)
    )::uuid as id,
    sender.id as sender_id,
    receiver.id as receiver_id,
    case rounds.round_no
      when 1 then 'Người truyền động lực'
      when 2 then 'Người luôn sẵn sàng hỗ trợ'
      when 3 then 'Người giữ nhịp dự án'
      when 4 then 'Người tiếp sức bền bỉ'
      else 'Người truyền cảm hứng'
    end as title,
    case rounds.round_no
      when 1 then
        'Cảm ơn bạn đã hỗ trợ team rất nhiều trong giai đoạn nước rút. #teamwork #gratitude'
      when 2 then
        'Cảm ơn vì luôn support nhanh và rõ ràng cho mọi người. #support #teamwork'
      when 3 then
        'Cảm ơn bạn vì khả năng giữ nhịp và phối hợp rất tốt với cả nhóm. #leadership #gratitude'
      when 4 then
        'Cảm ơn bạn đã luôn đứng ra xử lý các việc khó và không để ai bị bỏ lại phía sau. #kindness #ownership'
      else
        'Cảm ơn nguồn năng lượng tích cực và tinh thần lan tỏa của bạn tới cả team. #growth #gratitude'
    end as content,
    '{}'::text[] as image_urls,
    (rounds.round_no = 2) as is_anonymous,
    case
      when rounds.round_no = 2 then 'Một đồng nghiệp bí ẩn'
      else null::text
    end as anonymous_name,
    case rounds.round_no
      when 1 then array['#teamwork', '#gratitude']::text[]
      when 2 then array['#support', '#teamwork']::text[]
      when 3 then array['#leadership', '#gratitude']::text[]
      when 4 then array['#kindness', '#ownership']::text[]
      else array['#growth', '#gratitude']::text[]
    end as hashtags,
    now() - (((sender.rn - 1) * 5 + rounds.round_no) || ' hour')::interval as created_at
  from ordered_profiles sender
  cross join generate_series(1, 5) as rounds(round_no)
  join ordered_profiles receiver
    on receiver.rn = (
      (
        sender.rn - 1 +
        (((rounds.round_no - 1) % (sender.total_profiles - 1)) + 1)
      ) % sender.total_profiles
    ) + 1
  cross join lateral (
    select md5('seed-kudos:' || sender.id::text || ':' || rounds.round_no::text) as seed_hash
  ) hashes
)
insert into public.kudos (
  id,
  sender_id,
  receiver_id,
  title,
  content,
  image_urls,
  is_anonymous,
  anonymous_name,
  hashtags,
  created_at
)
select
  seeded.id,
  seeded.sender_id,
  seeded.receiver_id,
  seeded.title,
  seeded.content,
  seeded.image_urls,
  seeded.is_anonymous,
  seeded.anonymous_name,
  seeded.hashtags,
  seeded.created_at
from generated_kudos seeded
on conflict (id) do nothing;

with ordered_profiles as (
  select
    id,
    row_number() over (order by id) as rn,
    count(*) over () as total_profiles
  from public.profiles
),
generated_kudos as (
  select
    (
      substr(seed_hash, 1, 8) || '-' ||
      substr(seed_hash, 9, 4) || '-' ||
      substr(seed_hash, 13, 4) || '-' ||
      substr(seed_hash, 17, 4) || '-' ||
      substr(seed_hash, 21, 12)
    )::uuid as id,
    sender.id as sender_id,
    now() - (((sender.rn - 1) * 5 + rounds.round_no) || ' hour')::interval as created_at
  from ordered_profiles sender
  cross join generate_series(1, 5) as rounds(round_no)
  cross join lateral (
    select md5('seed-kudos:' || sender.id::text || ':' || rounds.round_no::text) as seed_hash
  ) hashes
),
generated_likes as (
  select
    liker.id as user_id,
    kudos.id as kudos_id,
    kudos.created_at + (liker.rn || ' minute')::interval as created_at
  from generated_kudos kudos
  join ordered_profiles liker
    on liker.id <> kudos.sender_id
)
insert into public.kudos_likes (user_id, kudos_id, created_at)
select
  seeded_likes.user_id,
  seeded_likes.kudos_id,
  seeded_likes.created_at
from generated_likes seeded_likes
where exists (
  select 1
  from public.kudos k
  where k.id = seeded_likes.kudos_id
)
on conflict (user_id, kudos_id) do nothing;

with ordered_profiles as (
  select
    id,
    row_number() over (order by id) as rn
  from public.profiles
),
generated_gifts as (
  select
    profile.id as user_id,
    case ((profile.rn - 1) % 6)
      when 0 then 'Nhận được icon Revival'
      when 1 then 'Nhận được icon Touch of Light'
      when 2 then 'Nhận được icon Stay Gold'
      when 3 then 'Nhận được icon Flow to Horizon'
      when 4 then 'Nhận được icon Beyond the Boundary'
      else 'Nhận được icon Root Further'
    end as gift_name,
    now() - ((profile.rn * 10) || ' minute')::interval as created_at
  from ordered_profiles profile
)
insert into public.gift_logs (user_id, gift_name, created_at)
select
  seeded_gifts.user_id,
  seeded_gifts.gift_name,
  seeded_gifts.created_at
from generated_gifts seeded_gifts
where not exists (
  select 1
  from public.gift_logs g
  where g.user_id = seeded_gifts.user_id
    and g.gift_name = seeded_gifts.gift_name
);

commit;
