---
feature: F006
phase: 07
title: All Kudos feed + stats sidebar + top-10
status: done
---

# Phase 07 — All Kudos feed + stats sidebar + top-10

## Context Links
- Spec: FR-12 (header), FR-13 (feed cards — via Phase 04 card), FR-14 (empty state),
  FR-17 (click a hashtag-tag → set hashtag filter), FR-18 (stats sidebar), FR-19 ("Mở quà"
  → minimal static dialog), FR-20 (top-10 gift recipients, sidebar scrolls independently),
  FR-21 (recipients empty state "Chưa có dữ liệu").
- Clarifications: stats are static mock figures (no real computation); "Mở quà" opens a
  minimal static placeholder dialog (no reward logic); top-10 repeats one placeholder row;
  server-renderable where possible, client only where interactivity requires.
- Depends: **01** (data/types), **03** (avatar, section-heading), **04** (kudos-card).

## Overview
- **Priority:** P1 · **Status:** pending
- The All Kudos section: a filter-driven feed (client) + a mostly-static stats/top-10 sidebar
  (server-renderable, one client leaf for the dialog). File ownership is distinct from Phases
  05/06 → parallel-runnable after shared deps.

## Key Insights
- The feed (`all-kudos-feed`) is CLIENT because it receives filtered posts + `onHashtagClick`
  from the board. The sidebar (`kudos-sidebar`, `kudos-stats-box`, `recent-gift-recipients`)
  is presentational/server-renderable and is passed to the board as the `sidebar` slot
  (Phase 08) so it stays out of the client bundle — EXCEPT `open-gift-button` (client dialog).
- FR-17 hashtag-click sets the board's hashtag filter → the feed only forwards the tag up via
  the `onHashtagClick` prop supplied by the board (Phase 08 wires it to `setHashtag`).
- Stats row count: render whatever `KUDOS_STATS` provides (FR-18 lists 4; screenshot shows 5
  incl. hearts). Drive rows from the data + `kudos.stats.*` labels — both counts work.
- Sidebar scrolls independently (FR-20) → `overflow-y-auto max-h-...` on the sidebar column.

## Requirements
- **FR-12/13/14 (feed):** heading ("ALL KUDOS"); vertical list of `<KudosCard variant="feed">`;
  clickable hashtags (FR-17); empty → "Hiện tại chưa có Kudos nào." (`kudos.empty.kudos`).
- **FR-18 (stats):** received / sent / hearts / secretBoxOpened / secretBoxUnopened rows with
  labels + values.
- **FR-19 (gift):** "Mở quà" button → minimal static dialog (title + body, close button); no
  reward logic, no persistence.
- **FR-20/21 (top-10):** 10 rows (avatar + gold name + gift description); empty → "Chưa có
  dữ liệu"; sidebar scrolls independently.
- **NFR-2:** each file <200 lines.

## Architecture / boundary
| File | Boundary | Notes |
|------|----------|-------|
| `all-kudos-feed.tsx` | **`"use client"`** | receives filtered posts + `onHashtagClick`; maps feed cards; empty state |
| `kudos-sidebar.tsx` | presentational | composes stats-box + recent-recipients; the board's `sidebar` slot |
| `kudos-stats-box.tsx` | presentational | stats rows + renders `<OpenGiftButton/>` |
| `open-gift-button.tsx` | **`"use client"`** | button + minimal static dialog (`useState` open) |
| `recent-gift-recipients.tsx` | presentational | top-10 list (avatar + name + gift), empty state |

Data flow: board → filtered posts → `all-kudos-feed`; page → stats/recipients → `kudos-sidebar`
(server-rendered) → passed to board as `sidebar` slot.

## Related Code Files
- **Create:** `app/components/kudos/all-kudos-feed.tsx` (`"use client"`) + test
- **Create:** `app/components/kudos/kudos-sidebar.tsx` + test
- **Create:** `app/components/kudos/kudos-stats-box.tsx` + test
- **Create:** `app/components/kudos/open-gift-button.tsx` (`"use client"`) + test
- **Create:** `app/components/kudos/recent-gift-recipients.tsx` + test
- **Read for context:** `app/components/kudos/{kudos-card,avatar,kudos-section-heading}.tsx`, `lib/kudos/{kudos-data,kudos-types}.ts`

## Implementation Steps
1. `all-kudos-feed.tsx`: `"use client"`; props `{ posts; cardLabels; emptyLabel; onHashtagClick }`;
   heading "ALL KUDOS" + vertical list of `<KudosCard variant="feed" onHashtagClick .../>`;
   empty → `emptyLabel`.
2. `kudos-stats-box.tsx`: map `KUDOS_STATS` → labeled rows; render `<OpenGiftButton/>` at bottom.
3. `open-gift-button.tsx`: `"use client"`; `useState(false)` open; button (`kudos.gift.openButton`)
   opens a minimal dialog (`<dialog>` or a div overlay) with `dialogTitle`/`dialogBody` + close.
4. `recent-gift-recipients.tsx`: heading (`kudos.recent.heading`); 10 rows (`<Avatar/>` + gold
   name + gift desc); empty → `kudos.empty.recipients`.
5. `kudos-sidebar.tsx`: compose stats-box + recent-recipients in the scrollable column
   (`overflow-y-auto`, FR-20).

## Todo List
- [x] `all-kudos-feed.tsx` (`"use client"`) — feed cards, empty state, hashtag click forwards tag
- [x] `kudos-stats-box.tsx` — rows from data + labels
- [x] `open-gift-button.tsx` (`"use client"`) — opens/closes minimal static dialog
- [x] `recent-gift-recipients.tsx` — 10 rows + empty state
- [x] `kudos-sidebar.tsx` — composes both, independent scroll
- [x] tests: feed renders cards + empty; hashtag click fires callback; stats rows render;
      gift dialog opens/closes; recipients list renders 10 + empty state
- [x] `npx tsc --noEmit` + vitest run

## Success Criteria
- Feed renders feed-variant cards + empty state; hashtag click forwards the tag; stats rows
  render from data; "Mở quà" opens/closes a static dialog; top-10 renders + empty state;
  sidebar scrolls independently; each file <200 lines; tests green.

## Risk Assessment
- **Stats row count mismatch FR-18 (4) vs screenshot (5) (Med/Low):** data-driven rows absorb
  both; follow screenshot labels, cite FR-18. **Open item in plan.md.**
- **Dialog a11y (Med/Low):** use `<dialog>` or role="dialog" + focus/close; static content only.
- **Feed accidentally pulls sidebar into client bundle (Med/Low):** keep sidebar OUT of the feed;
  it is a separate slot passed to the board (Phase 08), not a child of the feed.

## Security Considerations
- Static figures + placeholder dialog; no reward logic, no persistence, no user input stored.
  None beyond existing gate.

## Next Steps
- Board (Phase 08) passes filtered posts + `onHashtagClick={setHashtag}` to the feed, and the
  server-rendered `<KudosSidebar/>` as the `sidebar` slot.
