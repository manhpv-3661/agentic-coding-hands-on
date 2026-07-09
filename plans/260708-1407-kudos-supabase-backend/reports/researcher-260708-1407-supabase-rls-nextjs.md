# Research — Supabase RLS + Next.js 16 patterns (Kudos backend)

Folded into phases 01-03. Key verified conclusions (sources: Supabase RLS /
managing-user-data / migrations docs; Next.js docs pinned to 16.2.10 =
installed version).

1. **RLS:** INSERT evaluates `WITH CHECK` only (USING ignored — footgun).
   Use `to authenticated` + `(select auth.uid())` (InitPlan perf). SQL idioms
   for select-all / insert-own / delete-own on all three tables in phase-01.
2. **Like count:** use `COUNT()` (embedded join), not a trigger (YAGNI at
   hundreds of posts). Baseline `base_hearts` preserves mock ordering.
3. **profiles sync:** `on auth.user created` → `handle_new_user()`
   (`security definer set search_path=''`, trivial/NULL-tolerant — a throw
   rolls back signup). OAuth gives display_name/avatar_url only;
   department/stars admin-seeded.
4. **Mutations:** Server Actions (idiomatic for UI-triggered), re-check
   `auth.uid()` inside each; `revalidatePath` BEFORE any `redirect`. Prefer
   `revalidatePath('/kudos')` over the newer `refresh()` on this custom fork.
5. **Toggle:** server check-then-act + `UNIQUE(user_id,post_id)` backstop
   (catch 23505). No RPC (YAGNI).
6. **Migrations:** single checked-in `schema.sql` run via Dashboard SQL
   editor; do NOT adopt CLI migration workflow half-way (desyncs history).

## Unresolved (→ plan open questions Q2/Q6)
- Who seeds profile department/stars.
- Exact OAuth `raw_user_meta_data` key names (verify one live row).
- Whether kudos posts should be editable (→ Q4; recommended immutable).
