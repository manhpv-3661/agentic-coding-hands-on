# Clarifications — Kudos Supabase Backend Pivot

This plan **supersedes the prior "no backend" decisions** for the Kudos
cluster (F006/F007/F008), recorded in:
- `plans/260706-2200-sun-kudos-live-board/clarifications.md` (mock module as DB)
- `plans/260706-2310-kudos-compose-form/clarifications.md` (session-only compose)
- `plans/260707-0008-kudos-like-toggle/clarifications.md` (session-only likes)

Reason: the user has decided (confirmed 2026-07-08) to pivot Kudos from the
frontend-only mock to a **real Supabase Postgres backend** (the existing
Supabase project already provisioned for Auth is the sole datastore — no
separate Postgres/Redis, no SQLite, whole app deploys to Vercel). This is a
deliberate scope change on top of the original ~40h frontend-only estimate.
SQLite was briefly floated and rejected (does not persist on Vercel
serverless). Login/homepage/countdown/i18n remain out of scope.

## Session 2026-07-08 — decisions taken (recommended defaults; confirm the Open items)

- Q: Datastore? → A: Existing Supabase Postgres project (sole datastore).
  Reuse `lib/supabase/server.ts` (`@supabase/ssr`) unchanged.
- Q: Migration tooling? → A: Single checked-in `supabase/schema.sql` +
  `seed.sql`, run once via Dashboard SQL editor. No Supabase CLI migration
  workflow (repo has zero `supabase/` dir; adopting CLI half-way desyncs
  history — research-backed).
- Q: Like count — trigger-maintained counter vs COUNT()? → A: `COUNT()` via
  embedded join (YAGNI at hundreds of posts). Baseline `base_hearts` column
  preserves the mock highlight-ordering; total = base_hearts + like rows.
- Q: Migration safety for the authless e2e (port 3100, no Supabase env,
  renders mock unauthenticated)? → A: Data layer branches on
  `isSupabaseConfigured()` — reads fall back to `KUDOS_POSTS`, mutations
  no-op. Authless `layout-contract.spec.ts` + spotlight-name-cloud test stay
  green with zero e2e changes. Keystone decision.
- Q: `KudosPost` type contract change? → A: NONE. Adapt DB rows → existing
  `KudosPost` at the repository boundary; selectors/cards/board unchanged.
- Q: Mutation mechanism? → A: Next.js Server Actions (`app/kudos/actions.ts`),
  re-checking `auth.uid()` inside each (defense-in-depth); `revalidatePath
  ('/kudos')` after success. Not Route Handlers.
- Q: Like toggle idempotency? → A: Server check-then-act + `UNIQUE(user_id,
  post_id)` backstop (catch `23505`). No RPC function (YAGNI).
- Q: Image upload storage? → A: Still NO real storage — persist only
  `image_count` (unchanged from F007; no Supabase Storage introduced).
- Q: `profiles` auto-provisioning? → A: `on auth.user created` trigger →
  `handle_new_user()` (`security definer set search_path=''`), copies
  display_name/avatar_url from OAuth metadata.
- Q: Decorative aggregate data (sidebar stats incl. fake Secret Box,
  Spotlight name-cloud + "388 KUDOS", "10 Sunner nhận quà")? → A:
  **Recommended stays mock** (decorative, not per-user, not persisted;
  keeps authless spotlight e2e green). Flagged Open below.

## Open — needs user confirmation BEFORE Phase 01

- **Q1 (Blocking) — Recipient model:** recommend **free-text snapshot**
  (`recipient_name` + `recipient_department` captured at compose), because no
  employee directory exists, OAuth gives no colleague list, and the current
  compose dropdown already derives recipients from post history. Sender is
  always the real auth user. Alternative: FK to `profiles` (real registered
  recipient) — cleaner leaderboard but the recipient picker would be near-empty
  until many staff have logged in. Trade-off: free-text loses the recipient's
  `stars` on the card (shows 0). Confirm free-text vs FK.
- **Q2 (Blocking) — Profile `department`/`stars` seeding:** OAuth provides
  neither. Who seeds them — a manual admin SQL run, an admin UI, or left
  blank for training (real users show empty dept / 0 stars)? Affects seed.sql
  and card fidelity.
- **Q3 (Important) — Seed sender identity:** the 12 mock posts need a real
  `sender_id` (FK). Seed under a designated admin/service profile, or relax
  the FK for seed rows? Depends on Q1/Q2.
- **Q4 (Important) — Kudos immutability:** recommend **immutable** (no update
  policy) + delete-by-author only, since the UI has no edit/delete affordance.
  Confirm no edit is wanted.
- **Q5 (Nice-to-have) — Decorative data:** confirm stats/spotlight/gift-list
  stay mock (recommended) vs. computed from real data (extra scope, separate
  sizing).
- **Q6 (Ops) — OAuth metadata keys:** exact `raw_user_meta_data` key names
  (`full_name` vs `name`, `avatar_url` vs `picture`) must be verified against
  one live `auth.users` row before finalizing `handle_new_user()`.

## Session 2026-07-08 (round 2) — Q1-Q4 confirmed, all recommended defaults taken

- Q: Recipient model — free-text snapshot vs FK to profiles? → A: **Free-text
  snapshot.** Sender always real auth user; recipient stays `recipient_name`
  and `recipient_department` captured at compose time. No employee directory
  requirement, no recipient-must-have-logged-in constraint.
- Q: Who seeds `profiles.department`/`stars` (OAuth gives neither)? → A:
  **Left blank, admin seeds via manual SQL later** (Dashboard SQL editor).
  No admin UI built. New real users show empty department / 0 stars until
  manually updated.
- Q: Seed the 12 existing mock posts into Postgres as real rows? → A: **No.**
  The 12 mock posts stay in `KUDOS_POSTS` (served via the existing mock
  fallback); only posts created from now on via the real compose flow write
  to Postgres. No admin/service profile needed to own legacy seed rows —
  this makes Q3 (seed sender identity) moot.
- Q: Kudos immutability — fully immutable vs delete-by-author? → A:
  **Fully immutable — no update AND no delete policy at all**, tighter than
  the plan's original "immutable + delete-by-author" recommendation. No
  edit/delete UI exists; do not add a delete policy or affordance.

Q5 (decorative data stays mock) and Q6 (verify OAuth metadata key names
against a live `auth.users` row before writing `handle_new_user()`) remain
as stated above — Q5's recommended default is accepted implicitly (not
re-asked); Q6 is an implementation-time verification step for Phase 01, not
a decision.

## Sequencing note (not for me to resolve)
`plans/260707-2337-site-layout-system-audit-fixes/` (parallel) may also edit
`app/components/kudos/kudos-page-client.tsx` and `app/kudos/page.tsx`. Phases
04/05 must land AFTER that plan's kudos work or via a coordinated merge point.
