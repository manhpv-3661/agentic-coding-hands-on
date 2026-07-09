# Project Changelog

Running record of significant changes, features, and fixes. Newest entries first.

## 2026-07-09 — Supabase dynamic data: awards, event info, Kudos aggregates (F002/F004/F006/F007/F008)

Extends the Kudos-only Supabase pivot (2026-07-08 entry, below) to the remaining
structural/numeric data across Awards, the Homepage award grid, homepage event info, and the
Kudos board's decorative aggregates — full plan:
`plans/260709-0822-supabase-dynamic-data-all-screens/` (phases 1–4 shipped; this entry is phase
5, docs-only). Mirrors the same `isSupabaseConfigured()` fallback pattern as
`lib/kudos/kudos-repository.ts` throughout: configured → Postgres; not configured → the
existing static mock, verbatim — zero e2e changes to the authless build (port 3100) or
`e2e/layout-contract.spec.ts`.

**Schema + seed (`supabase/schema.sql`, `supabase/seed.sql`)**
- Three new read-only content tables, alongside the 3 Kudos tables from 2026-07-08:
  `award_categories` (`slug` PK, `sort_order`, `thumbnail_src`, `quantity_number`,
  `value_amount_vnd`, `individual_amount_vnd`, `collective_amount_vnd`), `event_settings`
  (singleton `id = 1`, `event_name`, `venue_name`), `kudos_gifts` (`id`, `unique(sort_order)`,
  `recipient_name`, `gift_text`).
- All three: RLS enabled, SELECT granted to `anon, authenticated` (public content, renders
  pre-login — unlike the authenticated-only Kudos tables), **no INSERT/UPDATE/DELETE policy on
  any of them** — content is edited exclusively via the Supabase SQL editor, same convention as
  `profiles.department`/`stars`. No admin CRUD UI was added (explicit decision, not an
  omission).
- Seeded via `supabase/seed.sql`, transcribed verbatim from the current mock/dict sources,
  idempotent (`on conflict do nothing`).

**Awards (`lib/awards/award-categories-repository.ts`, `-fallback.ts`, `format-prize-amount.ts`,
`app/awards/page.tsx`, `app/components/awards/award-detail-data.ts`) — F004**
- `/awards` now reads `award_categories` via `getAwardCategories()`, joined by `slug` with
  `lib/i18n/dictionaries/{en,vi}.ts` for localized titles/descriptions/units (i18n itself is NOT
  migrated — explicit scope decision, out of scope for this plan).
- VNĐ amounts are now stored as integers and formatted at render via `Intl.NumberFormat`
  (`formatVnd`), replacing pre-formatted string literals — this closes a real drift bug: the MVP
  category had two disagreeing title variants across 3 files (short "MVP" vs. long "MVP (Most
  Valuable Person)"), and the amount strings were hand-typed independently in
  `award-categories.ts`, `award-detail-data.ts`, and `awards-section.tsx`.

**Homepage integration (`lib/event/event-settings-repository.ts`, `format-event-date.ts`,
`app/page.tsx`, `app/components/home/{awards-section,event-info,hero-section}.tsx`) — F002**
- The homepage award grid now reads from the SAME `getAwardCategories()` repo as `/awards` —
  kills a 3-file duplicated award list.
- `event_settings` backs venue/event name (previously hardcoded in `event-info.tsx`).
- The displayed event date is now DERIVED via `Intl.DateTimeFormat` from the SAME env var
  (`NEXT_PUBLIC_EVENT_START_AT`) that gates routing in `proxy.ts` and drives the countdown — fixes
  a genuine pre-existing bug where the env var, the English dict ("December 26, 2025"), and the
  Vietnamese dict ("26/12/2025") were three independently-typed, disagreeing dates. `proxy.ts`/
  countdown timing itself is UNCHANGED — deliberately stays env-var, not DB: `proxy.ts` fires on
  nearly every request, so keeping that read a zero-latency env-var lookup rather than a DB
  round-trip is a deliberate hot-path/fail-open choice, not an oversight. Do not re-litigate this.
- `hero-section.tsx` gained a plain `venueName` string prop (pass-through, not new hero content)
  to thread venue data down without breaking the test harness — an async-Server-Component
  alternative was tried and reverted because RTL can't render a Promise-returning component.

**Kudos aggregates → real (`lib/kudos/kudos-aggregates-repository.ts`, `app/kudos/page.tsx`) —
F006/F007/F008**
- **Supersedes** this changelog's own 2026-07-08 entry ("Kudos backend pivot", below, under
  **Data layer**), which stated: *"Decorative aggregate data (sidebar stats, Spotlight
  name-cloud counter, top-10 gift list) intentionally stays mock/unchanged."* That decision is
  explicitly REVERSED here.
- Sidebar sent/received/hearts (FR-18) are now computed via live `COUNT` queries scoped to
  `auth.uid()`. Spotlight total ("{n} KUDOS") is a live count of `kudos_posts`. Spotlight
  name-cloud names are real `recipient_name` values, topped up from the mock constant if fewer
  than the slot count (preserves the fixed word-cloud layout geometry). The top-10 gift list
  reads the new `kudos_gifts` table.
- Secret-box opened/unopened counts are explicitly **NOT resolved** — no data source exists for
  them (pure gamification, no backing table); they pass through the mock constant unchanged,
  pending a future product decision. This is a genuinely open question, not a shipped decision.

**Scope deferrals (explicit decisions, not omissions)**
- i18n dictionaries stay static TS — NOT moved to Supabase.
- No admin CRUD UI added for any of the 6 tables (3 Kudos + 3 new content tables) — all edited
  via the Supabase SQL editor.
- Login (F001) and Countdown-Prelaunch (F003) needed no schema/data-layer changes: F001 is
  already fully dynamic via Supabase Auth and pure i18n chrome; F003's gating timestamp
  deliberately stays an env var (see above).

**Not done this pass**: `e2e/homepage-content.spec.ts:91` asserts the literal old (wrong) date
string `"26/12/2025"` on the authless e2e project — now that the date is correctly derived from
the env var, this assertion will fail. This is the correct, intended consequence of fixing the
date-drift bug above, not a regression; per this session's standing preference to defer test
updates to a separate pass (see the 2026-07-09 desktop-only entry's "Not done this pass"
paragraph, below), it was NOT fixed in this round — flagged here as follow-up work.

Docs impact: `docs/system/architecture.md` gains a "Content tables (awards / event / kudos
gifts)" subsection; `docs/features/f002-homepage/feature.md` and
`f004-awards-information/feature.md` get appended notes (award grid + event info now DB-backed
for structural/numeric data); `f006-sun-kudos-live-board/feature.md`,
`f007-kudos-compose-form/feature.md`, and `f008-like-kudos/feature.md` each get an appended note
on the aggregate reversal (not rewritten).

## 2026-07-09 — Desktop-only conversion + exact-size banner overlay (login/home/awards/kudos)

**BREAKING UX change** (user-directed): removed all responsive behavior site-wide.
Full plan: `plans/260709-0724-desktop-only-banner-overlay-fix/` (phases 1–5 done; phase
6 — e2e suite rewrite — deferred, not gating this change).

- `PageGutter` (`app/components/layout/page-layout.tsx`) flattened from
  `px-6 sm:px-10 lg:px-36` to a flat `px-36` (144px gutter always, no breakpoint
  scaling). `ContentFrame` max-widths (1120/1152/1224) unchanged.
- Every `sm:`/`md:`/`lg:`/`xl:` Tailwind variant removed from site chrome
  (header/footer/nav), `prelaunch`, and all four screens (login/home/awards/kudos) and
  their owned components — each collapsed to its desktop value. Mobile/tablet no longer
  reflow; pages render at their single native Figma width (1440 for login/awards/kudos,
  1512 for home) and do not adapt below it.
- Each screen's keyvisual/banner rebuilt as an exactly-sized box (Figma px, not
  `bg-cover` approximation) with its title/text composited on top via absolute overlay,
  instead of sitting in flow below/beside the banner: Login 1441×1022, Awards 1440×547
  (KV logo overlaid at 144,184), Kudos 1440×512 (title overlaid at top:184). Home was
  already structurally correct; only its responsive height tiers were flattened to the
  native 1512 values.
- Fixed a stacking-context bug found during verification: `-z-10` backdrop elements
  need their positioned parent to carry `isolate` (or an explicit `z-index`), otherwise
  the parent's own opaque background paints *above* the negative-z-index child instead
  of below it. `app/login/page.tsx` was missing this (added); `app/page.tsx` already
  had it; kudos/awards use non-negative z-index patterns so were unaffected.
- Fixed a broken CSS build: Tailwind v4's automatic content scanner was picking up
  binary PNG screenshots left under `plans/` (from earlier audit sessions) as class
  candidates, producing a corrupt generated selector that failed to parse and 500'd
  every route. `app/globals.css` now explicitly scopes scanning to `./` (app),
  `../lib`, `../hooks` via `@import "tailwindcss" source(none)` + explicit `@source`.
- Login/Kudos keyvisual crop transforms are documented reconstructions (Figma media
  export is auth-broken for those two nodes) — box size is exact, crop math is tuned to
  the substitute asset, not a pixel-perfect claim.
- Not done this pass: `e2e/layout-contract.spec.ts` still asserts the old responsive
  sub-native-viewport sweeps — will fail as-is against this change; rewrite is phase 6,
  intentionally deferred (tests come after the code is confirmed correct, per standing
  preference). `page-layout.test.tsx` and other component tests referencing stripped
  `sm:`/`lg:` classes are also expected to fail until that follow-up pass.

## 2026-07-08 — Kudos backend pivot: mock → Supabase Postgres (F006/F007/F008)

Pivots the Kudos cluster (screens 13/14/15) from a frontend-only mock
(`lib/kudos/kudos-data.ts`) to a real Supabase Postgres backend for posts, likes, and
compose — full plan: `plans/260708-1407-kudos-supabase-backend/`. This **supersedes**
the "no backend" decisions recorded in the three prior Kudos `clarifications.md` files:
`plans/260706-2200-sun-kudos-live-board/clarifications.md`,
`plans/260706-2310-kudos-compose-form/clarifications.md`, and
`plans/260707-0008-kudos-like-toggle/clarifications.md`.

**Schema (`supabase/schema.sql`)**
- Three tables: `profiles` (1:1 `auth.users`, auto-provisioned by the `handle_new_user()`
  signup trigger; `department`/`stars` have no OAuth source and are admin-seeded
  manually later), `kudos_posts` (real `profiles` FK sender; free-text
  `recipient_name`/`recipient_department` snapshot — no employee directory exists),
  `kudos_likes` (join table, `UNIQUE(user_id, post_id)`).
- RLS: `kudos_posts` is fully immutable — SELECT + INSERT-own only, no UPDATE and no
  DELETE policy at all (no edit/delete UI exists). `kudos_likes` adds DELETE-own for the
  unlike toggle. `profiles` allows UPDATE-own.

**Data layer**
- `lib/kudos/kudos-repository.ts` and `app/kudos/actions.ts` branch on
  `isSupabaseConfigured()`: configured → real Postgres reads/writes; not configured →
  reads fall back to the static `KUDOS_POSTS` mock exactly as before, mutations no-op.
  This keeps the authless e2e build (port 3100, no Supabase env) rendering the mock
  unchanged, so `e2e/layout-contract.spec.ts` (including the spotlight-name-cloud test)
  stays green with zero e2e changes.
- Two Server Actions, `createKudosAction` and `toggleLikeAction`, both re-check
  `auth.uid()` server-side, block self-likes, and treat a `23505` unique-violation race
  on a double-like as an idempotent success rather than an error.
- No legacy data migration: the 12 existing mock posts stay in `kudos-data.ts` as the
  mock fallback; only posts created from now on via the real compose flow persist to
  Postgres. Decorative aggregate data (sidebar stats, Spotlight name-cloud counter,
  top-10 gift list) intentionally stays mock/unchanged.

**Not yet live**: `supabase/schema.sql` has not been run against the production
Supabase project — no session in this repo has service_role/DB credentials to execute
DDL. A human with Dashboard access must run it manually (see `supabase/README.md`).
Until then the app behaves exactly as it did before this pivot.

Docs impact: `docs/system/architecture.md` gains a "Kudos — Lớp dữ liệu (Supabase
Postgres)" subsection; `docs/features/f006-sun-kudos-live-board/feature.md`,
`f007-kudos-compose-form/feature.md`, and `f008-like-kudos/feature.md` each get an
appended note flagging their prior "no backend" lines as superseded (not rewritten).

## 2026-07-07 — Site visual fidelity fixes (F002/F004/F005/F006/F007 pixel audit)

Full-site pass closing the "80% matching the design" gap the product owner flagged
against the live MoMorph ground truth for the Homepage, Awards, site chrome
(header/footer), and Kudos screens. Seven phases: font wiring, avatar/gallery
image reversal, and per-screen pixel audits (Home, Awards, Chrome, Kudos), closed
out here with a full-site re-verification and integration pass.

**Font wiring**
- Montserrat is now the global default font (`app/layout.tsx` + `app/globals.css`),
  replacing the `create-next-app` Geist boilerplate; real brand metadata
  ("Sun* Annual Awards 2025") replaces the default title/description.
- Montserrat Alternates now includes the `"vietnamese"` subset for bilingual VI/EN
  copy.
- Countdown digit glyphs (Homepage hero + Prelaunch countdown) now render in
  "Digital Numbers" — the font Figma specifies — self-hosted via `next/font/local`
  (`app/fonts/digital-numbers/DigitalNumbers-Regular.ttf`, SIL OFL 1.1) since the
  family isn't published to the live Google Fonts CDN yet. Verified against
  MoMorph ground truth: 49.152px (Homepage) / 73.728px (Prelaunch), weight 400,
  matching the digit-box sizing exactly (font size and box are Figma-paired
  values, so glyph fit has zero drift risk).

**Avatar / gallery images**
- Reversed the original "initials/placeholder" assumption for Kudos avatars and
  the gallery: real cropped photos (`public/kudos/avatars/*.jpg`,
  `public/kudos/gallery/photo-1.jpg`) are the correct, final assets — initials
  render only as a genuine per-image fallback (blank/whitespace name), not a
  global default.

**Full-site pixel audit**
- Homepage: zero drift found against ground truth across hero, countdown,
  event info, CTA buttons, awards section, Sun Kudos section, and the floating
  widget button.
- Awards page: fixed a double-applied 144px gutter (`max-w` + `mx-auto` stacked
  on top of `lg:px-36`, shrinking content to 864px instead of 1152px), centered
  the title/eyebrow block, corrected the nav menu's font-weight/letter-spacing,
  and closed several award-detail-card gaps (background photo position,
  description weight/justification, icon-row gaps, content-group dividers,
  quantity/value label-vs-value typography split). A follow-up full-site pass
  (this phase) additionally corrected the awards-catalog two-column gap (effective
  121px, not the naively-computed 80px, due to `justify-content: space-between`
  interacting with two fixed-width columns) and re-derived the hero cover
  gradient's stop percentages, which had been miscalculated during the original
  per-screen pass.
- Site chrome: header was already ground-truth conformant; fixed the footer's
  nav-link border-radius (0px per design, was inheriting the header's 4px).
  Confirmed structural parity across `/`, `/awards`, and `/kudos` — all three
  pages render the same `SiteHeader`/`SiteFooter` components, so chrome
  consistency is guaranteed by shared-component reuse, not per-page styling.
- Kudos: fixed sidebar stats-box row/divider spacing, gift-recipients box
  padding, and the Spotlight board's "388 KUDOS" counter (was 24px gold, is
  36px/44 white per ground truth).

**Known, accepted gaps (not closed this phase)**
- Awards quantity/value metadata: Figma splits the number (36px) from its
  unit/qualifier phrase (14px) as two text nodes; the current data model
  (`award-detail-data.ts`) holds each as one combined string, so a single
  24px size is used as the closest single-size approximation. Closing this
  fully requires a data-model change (splitting the fields), which is out of
  this phase's scope.
- Awards catalog: Figma authors two visually distinct card sub-layouts across
  the 6 award entries; this codebase intentionally uses one shared
  `AwardDetailCard` component per the plan's own requirement, so per-variant
  pixel-parity isn't simultaneously achievable with that constraint.
- Kudos: the Highlight carousel's gradient-fade mask blend, the Spotlight
  name-cloud's algorithmic (non-deterministic-vs-Figma) placement, and one
  sub-pixel search-pill scale artifact are not verifiable through static
  analysis and would need a live-browser render to confirm.

Docs impact: minor — this changelog entry is new (file didn't previously
exist); no architecture or API documentation changed.
