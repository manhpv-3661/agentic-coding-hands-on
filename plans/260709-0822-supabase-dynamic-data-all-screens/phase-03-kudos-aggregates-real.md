# Phase 03 — Kudos Aggregates → Real

## Context Links
- Reverses: `docs/project-changelog.md:76-77` ("decorative aggregate data ... intentionally stays mock/unchanged") — per user scope decision #2.
- Pattern: `lib/kudos/kudos-repository.ts` (live COUNT, guard-clause fallback), `app/kudos/page.tsx:63-68,104-112`
- Research: R1 §3/§4 (exact mock sources + what is / isn't computable from the 3 tables)
- Depends on: phase-01 (`kudos_gifts` seed)

## Overview
- **Priority:** P1 · **Status:** pending
- **Description:** Compute the Kudos board's decorative aggregates from real Supabase data where a source exists (sidebar sent/received/hearts, spotlight total + names), read the gift list from the seeded `kudos_gifts` table, and keep the existing mock as the unconfigured fallback. Flag the secret-box counts (no organic source).

## Key Insights (R1 §4 — what is actually computable)
| UI value | Current mock (file:line) | Real source | Verdict |
|---|---|---|---|
| Sidebar `sent` | `kudos-data.ts:152-158` | `count(kudos_posts where sender_id = me)` | Computable |
| Sidebar `received` | same | `count(kudos_posts where recipient_name = my display_name)` | Computable (fuzzy: free-text recipient, no FK) |
| Sidebar `hearts` | same | `count(kudos_likes join kudos_posts on post_id where sender_id = me)` | Computable |
| Sidebar `secretBoxOpened/Unopened` | same | **none** — gamification, no table | **UNRESOLVED (Q1)** |
| Spotlight total (`388`) | `kudos-spotlight-data.ts:15` | `count(*) kudos_posts` | Computable |
| Spotlight names | `spotlight-name-cloud-slots.ts:24` | `recipient_name` from `kudos_posts` | Computable (but Figma-textured today; see risk) |
| Top-10 gift list | `kudos-data.ts:167-170` | `kudos_gifts` seed (phase-01) | Read from DB |
| Spotlight ticker rows | `kudos-spotlight-data.ts:25-27` | none defined | Leave mock (not in scope #2's named three) |

- No materialized view — live COUNT matches `schema.sql:11-14`'s stated philosophy; data volume is tiny (mock/training). Justified: MV adds refresh triggers/cron = complexity for no benefit (YAGNI).
- Sidebar stats are the **current user's** (numbers look per-user; sidebar is "your kudos"). Compute against `auth.uid()`; unconfigured / no-user → `KUDOS_STATS` mock.
- `received` matches free-text `recipient_name` to the profile `display_name` — inherently approximate (no employee directory, by design). Acceptable; note it.

## Requirements
Functional:
- `getKudosSidebarStats(user)` → `KudosStats` (received/sent/hearts real; secretBox per Q1 outcome). Fallback `KUDOS_STATS`.
- `getSpotlightTotal()` → number (`count(*) kudos_posts`). Fallback `SPOTLIGHT_TOTAL` (388).
- `getSpotlightNames()` → names for the cloud. Fallback `SPOTLIGHT_NAMES`.
- `getGiftRecipients()` → top-10 from `kudos_gifts`. Fallback `RECENT_GIFT_RECIPIENTS`.

Non-functional:
- Same shapes the components already consume (`KudosStats`, `GiftRecipient`, spotlight props) — no component prop-shape changes.
- Never throw; error → console.error + mock fallback.

## Architecture
```
app/kudos/page.tsx (server)
  ├─ getKudosSidebarStats(user)  → KudosStats   → KudosSidebar (props unchanged)
  ├─ getGiftRecipients()         → GiftRecipient[] → KudosSidebar
  ├─ getSpotlightTotal()         → number         → spotlight
  └─ getSpotlightNames()         → string[]        → spotlight name-cloud
```
- New repo file keeps these separate from `kudos-repository.ts` (posts/likes) to respect the 200-line limit and the read/mutation split.
- Spotlight name-cloud has fixed visual SLOTS (`spotlight-name-cloud-slots.ts`); feed real names INTO the existing slot layout — do not change the slot geometry (layout-contract).

## Related Code Files (OWNERSHIP: phase-03 only)
- Create: `lib/kudos/kudos-aggregates-repository.ts` (the 4 functions above, server-only)
- Modify: `app/kudos/page.tsx` (call the new repo, replace the mock consts passed at `:104-112`)
- Modify (only if prop wiring needs it): `app/components/kudos/kudos-sidebar.tsx` — likely unchanged (same prop shapes)
- Read-only ref (do NOT edit): `lib/kudos/kudos-data.ts`, `kudos-spotlight-data.ts`, `spotlight-name-cloud-slots.ts` (kept as the fallback source)
- **NOT** touched: `lib/kudos/kudos-repository.ts`, `app/kudos/actions.ts` (posts/likes untouched)

## Implementation Steps
1. Create `kudos-aggregates-repository.ts` with the 4 functions; each: `isSupabaseConfigured()`/no-user guard → mock const; else query; on error → mock.
2. `sent` = `head:true, count:"exact"` on `kudos_posts` filtered `sender_id`. `received` = same filtered `recipient_name = display_name`. `hearts` = count on `kudos_likes` joined to own posts (or two-step: own post ids → count likes in). Prefer a single `count` query per stat for clarity.
3. `getSpotlightTotal` = exact count of `kudos_posts`. `getSpotlightNames` = select `recipient_name` (cap to slot count).
4. `getGiftRecipients` = `kudos_gifts` ordered by `sort_order` limit 10 → map to `GiftRecipient`.
5. Resolve secret-box per Q1 (default until answered: keep the mock `secretBoxOpened/Unopened` values passed through, clearly commented as "no data source — pending product decision").
6. Wire `app/kudos/page.tsx`; compile; verify unconfigured mode renders identical board.

## Todo List
- [ ] kudos-aggregates-repository.ts (4 functions, fallback branch each)
- [ ] sent/received/hearts count queries against auth.uid()
- [ ] spotlight total + names queries (respect slot cap)
- [ ] gift list from kudos_gifts
- [ ] secret-box: pass-through mock + comment (pending Q1)
- [ ] Wire page.tsx; compile; unconfigured-mode parity check

## Success Criteria
- Unconfigured mode: board identical to today (mock constants) — layout-contract e2e green, no e2e edits.
- Configured + seeded: sidebar sent/received/hearts reflect real rows; spotlight total = real post count; gift list = seeded rows.
- Creating a kudos (existing compose flow) then reloading changes `sent`/spotlight total.
- No prop-shape change forced on sidebar/spotlight components.

## Risk Assessment
- **Double-count / self-like skew (Med/Low):** hearts aggregation overlapping the existing per-post like logic in `kudos-repository.ts`. Mitigation: aggregate hearts here is "likes on posts I *sent*", independent of the viewer's own-like exclusion in the feed — keep them separate; document the distinction.
- **Spotlight names lose Figma texture (Med/Med):** design's repeated-name texture (R1 §4) replaced by real recipients could look sparse with few rows. Mitigation: if real names < slot count, top up from fallback names to preserve layout density; never leave empty slots (layout-contract).
- **`received` false matches (Low/Med):** display_name collisions. Acceptable in a mock app; note it.
- **Reversal not breaking prod (High/Low):** e2e build is unconfigured → hits fallback = today's behavior exactly. Verified by parity check.

## Security Considerations
- Stats scoped to `auth.uid()` server-side (never client-supplied id) — mirrors `actions.ts:47-53`.
- `kudos_gifts` public-read content; no PII beyond the seeded display name.

## Next Steps
- Independent of P2/P4 (disjoint files) — runs parallel to P2. Feeds changelog reversal note in P5.
