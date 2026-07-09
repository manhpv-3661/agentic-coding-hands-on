# Phase 02 — Kudos components dedup (group b)

## Context Links
- Plan: [plan.md](plan.md) · Foundation: [phase-00](phase-00-shared-primitives-foundation.md)
- Specs: f006-live-board, f008-like-kudos (behavior unchanged)

## Overview
- **Priority:** P1 · **Status:** done · **Depends on:** 00
- **Description:** Consolidate scattered icons, dedup sidebar/avatar chrome, fold one no-logic decorative file — inside `app/components/kudos/` (EXCLUDING `compose/`, which is phase 01).

## Key Insights

### Dead code
- `avatar.tsx:59,75,82` `initials`/`colorFor`/`photoFor` exported but only imported by `avatar.test.tsx` → drop `export` (keep internal), move any test needs to test-local. No other dead props/imports/state found in the 21 files.

### Duplication
- **Icon module scattered** — `kudos-card-icons.tsx` is the shared icon module (3 consumers) but icons live locally elsewhere:
  - `PencilIcon` duplicated: `kudos-banner.tsx:36-47` (24px) vs `kudos-card-icons.tsx:59-78` (32px, has className) → keep one in card-icons with optional size, delete banner copy.
  - `SearchIcon` near-dup: `kudos-banner.tsx:50-57` (24px) vs `spotlight-board.tsx:32-39` (16px) → one size-parameterized `SearchIcon` in card-icons.
  - `GiftIcon`/`CloseIcon` local in `open-gift-button.tsx:37-71` → move to card-icons (also trims that 236-line file ~35 lines).
  - Local `ChevronDownIcon` (kudos-filters.tsx:24) / `ChevronIcon` (highlight-kudos-carousel.tsx:45) — consolidate into card-icons if byte-compatible; else leave (do NOT force-merge divergent glyphs).
- **Sidebar panel chrome** `rounded-[17px] border border-[#998C5F] bg-[#00070C]` in `kudos-stats-box.tsx:39` & `recent-gift-recipients.tsx:22` (both only used by `kudos-sidebar.tsx`) → shared `sidebar-panel.tsx` wrapper (className merge). Preserve the per-instance padding differences via prop/className.
- **Identical Avatar call** (`size={64} className="shrink-0 border-[1.869px] border-white"`) in `kudos-person-block.tsx:22` & `recent-gift-recipients.tsx:48` — low priority; dedup only if `sidebar-panel` work already touches the files.
- **Intra-file heart+count** near-dup in `kudos-card.tsx:154-160` vs :163-168 (interactive vs legacy static). Extract in-file `HeartCount` ONLY if it doesn't risk the like behavior; otherwise leave. Low priority.
- `cn()` idiom in avatar.tsx:97,107, copy-link-button.tsx:66, kudos-image-gallery.tsx:43, kudos-section-heading.tsx:26 → adopt `lib/ui/cn`.

### Merge candidate
- `spotlight-collage-backdrop.tsx` (40 lines, single consumer, zero props, pure decorative, self-marked "swap & delete" stopgap) → inline into `spotlight-board.tsx`.

### Keep-as-is (line-budget splits with real reason)
`kudos-person-block.tsx`, `kudos-image-gallery.tsx` (folding back re-breaches kudos-card 200-cap), `kudos-card-icons.tsx` (3 consumers), `spotlight-name-cloud.tsx`/`spotlight-ticker.tsx` (real logic + tests), `kudos-section-heading.tsx` (3 consumers — genuinely shared), both optimistic hooks (real async/rollback logic, 1:1 with page-client).

## Requirements
- No behavior change; like/optimistic flows, spotlight rendering, board filtering identical.
- `use-kudos-optimistic-posts.ts` keeps importing compose helpers (phase 01 preserves them) — no edit needed to the import.

## Architecture
Icon consolidation centralizes into `kudos-card-icons.tsx` (single icon source). `sidebar-panel.tsx` becomes the sidebar chrome primitive. DAG otherwise unchanged; `spotlight-collage-backdrop.tsx` node removed.

## Related Code Files
**Modify:** kudos-card-icons.tsx, kudos-banner.tsx, spotlight-board.tsx, open-gift-button.tsx, kudos-filters.tsx, highlight-kudos-carousel.tsx, kudos-stats-box.tsx, recent-gift-recipients.tsx, avatar.tsx, kudos-card.tsx, copy-link-button.tsx, kudos-image-gallery.tsx, kudos-section-heading.tsx, kudos-person-block.tsx.
**Create:** sidebar-panel.tsx.
**Delete:** spotlight-collage-backdrop.tsx (after inline).

## Implementation Steps
1. Add size-parameterized `PencilIcon`/`SearchIcon`/`GiftIcon`/`CloseIcon` to `kudos-card-icons.tsx`; repoint consumers; delete local copies.
2. Create `sidebar-panel.tsx`; adopt in kudos-stats-box & recent-gift-recipients (preserve padding via className prop).
3. Inline `spotlight-collage-backdrop.tsx` into spotlight-board; delete file.
4. De-export avatar internal helpers.
5. Adopt `cn()` at the 5 idiom sites.
6. (Optional, low-risk-only) Avatar64 dedup / in-file HeartCount extraction.
7. `npm run lint && npm run test && npm run build`.

## Todo List
- [x] icons consolidated into card-icons, locals deleted
- [x] sidebar-panel created + adopted
- [x] collage-backdrop inlined + deleted
- [x] avatar helpers de-exported (tests still green)
- [x] cn() adopted
- [x] tests + lint + build green

## Success Criteria
- `kudos-board.test.tsx`, `kudos-card.test.tsx`, `open-gift-button.test.tsx`, `spotlight-board.test.tsx`, `kudos-stats-box.test.tsx`, `recent-gift-recipients.test.tsx`, `avatar.test.tsx`, `kudos-banner.test.tsx`, `highlight-kudos-carousel.test.tsx`, `kudos-filters.test.tsx`, `spotlight-*.test.tsx`, `kudos-page-client.test.tsx` pass unchanged.
- Icon rendering visually identical at each call site (sizes preserved).
- `open-gift-button.tsx` < 205 lines after icon move.

## Tests (add/update)
- **Update:** `avatar.test.tsx` — if helpers de-exported, exercise them through `Avatar` behavior instead of direct import (no coverage loss).
- **New:** `sidebar-panel.test.tsx` — renders children + merges className.
- **New:** `kudos-card-icons.test.tsx` (if none) — the moved icons render at requested size.
- Logic hooks `use-kudos-optimistic-likes.ts` / `use-kudos-optimistic-posts.ts`: keep existing coverage green; no new logic added.

## Risk Assessment
| Risk | L | I | Countermeasure |
|------|---|---|----------------|
| Size-param icon changes default render size somewhere | Med | Med | Default size = each old call site's literal; assert in tests |
| De-exporting avatar helpers breaks test import | High (if naive) | Low | Rewrite test to go through Avatar, or keep a test-only export |
| Forcing divergent chevron glyphs to merge changes visuals | Med | Med | Only merge byte-identical glyphs; leave divergent local |
| spotlight inline balloons spotlight-board >200 | Low | Low | backdrop is 40 static lines; board 181→~215 → may need to keep or trim; re-measure, keep split if over |

## Security Considerations
None — presentational only. Do not alter optimistic-update rollback logic while deduping.

## Next Steps
Parallel-safe with 01/03/04.
