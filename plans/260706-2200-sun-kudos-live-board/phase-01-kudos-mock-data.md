---
feature: F006
phase: 01
title: Kudos mock data module
status: done
---

# Phase 01 — Kudos mock data module

## Context Links
- Spec: FR-6, FR-13 (card fields), FR-10 (spotlight names + total), FR-15/16 (filter
  option sources), FR-18 (stats), FR-20 (top-10 gift recipients)
- Clarifications: `../clarifications.md` — "one static mock module `lib/kudos/kudos-data.ts`
  … single source of truth"; filter options derived from this module; timestamps/hearts
  static; spotlight is CSS name-cloud (no 388 real names needed — counter is a number);
  top-10 repeats the one design placeholder row.
- Pattern ref: `lib/awards/award-categories.ts` (typed static module), `award-detail-data.ts`
  (pure shaping function precedent).
- **MoMorph:** Sun* Kudos - Live board — https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ

## Overview
- **Priority:** P1 (everything else consumes it) · **Status:** pending
- Pure static data + pure selectors. NO React, NO `"use client"`, NO I/O. This module IS
  the stand-in "database" for the frontend-only mock project.

## Key Insights
- Content is mock Vietnamese data (names, post text, hashtags) — locale-independent, NOT
  translated (mirrors award category titles being hardcoded, not dictionary-driven). Only
  UI *labels* go through i18n (Phase 02).
- Timestamps stored as pre-formatted display strings (`"09:30 - 12/25/2025"`, FR-13 format
  `HH:mm - MM/DD/YYYY`) — no date library (YAGNI, mirrors `homepage.hero.eventDate` literal).
- Hearts/stars are static numbers (like-toggle is out of scope).
- Spotlight: a modest list (~20–30) of distinct recipient names for the CSS cloud + a
  separate `SPOTLIGHT_TOTAL` number (the "388 KUDOS" counter) — do NOT generate 388 names.
- Top-10 recipients: repeat the exact single design placeholder ("Huỳnh Dương Xuân" /
  "Nhận được 1 áo phông SAA") to 10 rows per clarifications (design has no distinct data).

## Requirements
- **FR-6/FR-13 (card):** each `KudosPost` supplies sender+recipient (name, department,
  stars), timestamp string, content, hashtags[], imageCount (0–5 gallery placeholders),
  hearts (number). `department` value(s) feed the filter.
- **FR-15/FR-16:** distinct hashtag list + distinct department list derived from posts.
- **FR-10:** spotlight name list + total counter.
- **FR-18:** stats figures (received, sent, hearts, secretBoxOpened, secretBoxUnopened).
- **FR-20:** 10 gift-recipient rows (name + short gift description).
- **NFR-2:** every file <200 lines, kebab-case.

## Architecture
Three files under `lib/kudos/`:
- `kudos-types.ts` — interfaces only: `KudosPerson { name; department; stars }`,
  `KudosPost { id; sender; recipient; timestamp; content; hashtags; imageCount; hearts }`,
  `KudosStat { key; value }` (or `KudosStats` object), `GiftRecipient { name; gift }`,
  `KudosFilterState { hashtag: string | null; department: string | null }`.
- `kudos-data.ts` — the datasets: `KUDOS_POSTS: KudosPost[]` (10–12 entries),
  `SPOTLIGHT_NAMES: string[]`, `SPOTLIGHT_TOTAL: number`, `KUDOS_STATS`,
  `RECENT_GIFT_RECIPIENTS: GiftRecipient[]` (10 rows). Imports types only.
- `kudos-selectors.ts` — pure functions: `getDistinctHashtags(posts)`,
  `getDistinctDepartments(posts)`, `filterKudos(posts, filter)` (matches when
  hashtag null-or-in-post AND department null-or-equals sender/recipient dept),
  `getTopKudosByHearts(posts, n = 5)` (sort desc by hearts, take n; stable).

Data flow: `page.tsx` imports posts + `getDistinct*` for filter options → passes to board;
board applies `filterKudos` then `getTopKudosByHearts` for the carousel.

## Related Code Files
- **Create:** `lib/kudos/kudos-types.ts`
- **Create:** `lib/kudos/kudos-data.ts`
- **Create:** `lib/kudos/kudos-selectors.ts`
- **Create:** `lib/kudos/kudos-selectors.test.ts`
- **Read for context:** `lib/awards/award-categories.ts`, `app/components/awards/award-detail-data.ts`

## Implementation Steps
1. Write `kudos-types.ts` with the interfaces above. Keep `KudosFilterState` here (shared
   by board + selectors).
2. Write `kudos-data.ts`: 10–12 posts drawn from the design (use design-visible sample
   names/departments/hashtags; where the design repeats one placeholder, repeat it). Ensure
   hashtags and departments have enough distinct values (≥3 each) to make the filter
   meaningful. Set varied `hearts` so top-5 ordering is non-trivial. `imageCount` 0–5.
3. Add `SPOTLIGHT_NAMES` (~24 recipient names incl. some overlapping post recipients so
   search demos work), `SPOTLIGHT_TOTAL = 388`.
4. Add `KUDOS_STATS` (received/sent/hearts/secretBoxOpened/secretBoxUnopened) and
   `RECENT_GIFT_RECIPIENTS` (10 identical placeholder rows).
5. Write `kudos-selectors.ts` pure functions; no mutation of inputs.
6. If `kudos-data.ts` approaches 200 lines, split the arrays but keep selectors in
   `kudos-selectors.ts` (do not merge).

## Todo List
- [x] `kudos-types.ts` interfaces
- [x] `kudos-data.ts` posts (≥3 distinct hashtags + departments, varied hearts)
- [x] spotlight names + total, stats, 10 gift recipients
- [x] `kudos-selectors.ts` (getDistinctHashtags/Departments, filterKudos, getTopKudosByHearts)
- [x] `kudos-selectors.test.ts`: distinct lists deduped; filterKudos AND-logic + empty result;
      getTopKudosByHearts returns ≤5 sorted desc; empty-input safe
- [x] `npx tsc --noEmit` + vitest run

## Success Criteria
- All three files <200 lines, compile clean.
- Selectors proven pure + correct by test (dedupe, AND filtering, empty cases, top-5 order).
- Distinct hashtag/department lists non-empty (filter has real options).

## Risk Assessment
- **Data volume blows 200-line file (Med/Low):** split arrays across data file(s), keep
  selectors separate. **Countermove:** cap posts at ~12; spotlight names ~24.
- **Filter yields empty (needed for FR-8/FR-14 empty state):** intentional — ensure at
  least one hashtag/department combo produces zero posts so empty-state is reachable/testable.

## Security Considerations
- Static read-only mock data; no user input, no secrets. None beyond existing gate.

## Next Steps
- Consumed by Phases 04 (card types), 05/06/07 (sections), 08 (board wiring).
