# Supabase Setup — SAA 2025 Mock Project

This directory now contains the canonical SQL for the agreed mock-project scope.

## Scope

- `profiles`
- `kudos`
- `kudos_likes`
- `gift_logs`
- storage bucket: `kudos-images`

Not in DB by design:

- Homepage SAA content
- Awards content
- i18n dictionaries
- Countdown config
- Spotlight Board content

Those stay in source code / local config.

## Files

- `schema.sql`
  Creates the 4 tables above, indexes, RLS policies, `handle_new_user()` trigger, and storage policies.
- `migrations/20260709_000001_init_saa_2025_mock_project.sql`
  Same schema in migration form.
- `reset.sql`
  Drops the 4 app tables, the signup trigger/function, and the `kudos-images` storage bucket.
- `repair_permissions.sql`
  Adds the missing `GRANT` statements for an already-created database without deleting data.
- `seed.sql`
  Optional temporary QA seed for `kudos`, `kudos_likes`, and `gift_logs`.
  It uses all existing `profiles` rows and is safe to re-run.
  If there are fewer than 2 rows in `profiles`, it fails loudly.

## How to apply

1. Open Supabase Dashboard.
2. Go to `SQL Editor`.
3. Copy `supabase/schema.sql`.
4. Run it.
5. If you want temporary QA data, ensure at least 2 users exist in
   `profiles`, then run `supabase/seed.sql`.

If your tables already exist and the web still cannot read/write them, run
`supabase/repair_permissions.sql` once. That fixes the missing grants without
dropping data.

If your team is using Supabase migrations elsewhere, use the migration file instead.

## Data model notes

`kudos` intentionally keeps a few UI-driven fields so the project stays at 4 tables without losing real behavior:

- `title`
- `image_urls text[]`
- `anonymous_name`

This keeps the schema aligned with the current Kudos compose UI while avoiding an extra attachments table.

## Quick verification

Run:

```sql
select tablename
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles', 'kudos', 'kudos_likes', 'gift_logs');
```

Expected: 4 rows.

Run:

```sql
select relname, relrowsecurity
from pg_class
where relname in ('profiles', 'kudos', 'kudos_likes', 'gift_logs');
```

Expected: `relrowsecurity = true` for all 4 rows.
