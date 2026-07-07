---
phase: 6
title: "Remaining Kudos pixel conformance (live board + spotlight)"
track: A
status: pending
priority: P2
effort: 4h
depends_on: []
parallel_safe_with: [1, 2, 3, 4, 5]
screen: "Kudos live board + Spotlight (enumerate via list_frames)"
file_ownership:
  - app/kudos/page.tsx
  - app/components/kudos/kudos-page-client.tsx
  - app/components/kudos/kudos-board.tsx
  - app/components/kudos/kudos-banner.tsx
  - app/components/kudos/kudos-sidebar.tsx
  - app/components/kudos/kudos-filters.tsx
  - app/components/kudos/kudos-stats-box.tsx
  - app/components/kudos/kudos-section-heading.tsx
  - app/components/kudos/all-kudos-feed.tsx
  - app/components/kudos/highlight-kudos-carousel.tsx
  - app/components/kudos/recent-gift-recipients.tsx
  - app/components/kudos/spotlight-board.tsx
  - app/components/kudos/spotlight-name-cloud.tsx
  - app/components/kudos/spotlight-ticker.tsx
  - app/components/kudos/kudos-person-block.tsx
  - app/components/kudos/kudos-card.tsx
  - app/components/kudos/kudos-card-icons.tsx
  - app/components/kudos/copy-link-button.tsx
  - "co-located *.test.tsx for the files above"
---

# Phase 6 — Remaining Kudos Pixel Conformance

## Context Links

- Method: `references/measurement-method.md`.
- Screens: Kudos live board + Spotlight — enumerate exact screenIds via `mcp__momorph__list_frames`
  / `get_project_overview` on file `9ypp4enmFmdK3YAFJLIu6C`.
- **Already conformant / out of scope:** `compose/**` (F007, 260707-0243), `open-gift-button.tsx`
  (F006, Secret Box), `avatar.tsx` + `kudos-image-gallery.tsx` (P2). `kudos-card`/`kudos-image-gallery`
  were measured (researcher-260707-0110) — **verify-only under the new global font; edit only on
  confirmed drift.**

## Overview

- **Priority:** P2 — the kudos board page beyond the already-fixed compose/secret-box/card.
- Measure the board layout, banner, sidebar/stats/filters, feed, carousel, recent-recipients, and
  the spotlight cluster against ground truth; close each Δ. Layout/spacing/type only. Track A,
  parallel-safe with all (owns no P2/compose/secret-box file).

## Requirements

- Diff tables per component group: board shell + page-client layout, banner (KV background stays
  the P2/crop asset — do not re-export), sidebar + stats-box + filters, all-kudos-feed +
  highlight-carousel, recent-gift-recipients, spotlight board + name-cloud + ticker. Every tracked
  Δ === 0.
- Preserve all behavior: board filtering, carousel, spotlight search-filter, copy-link, like toggle.
- `kudos-card`/icons/copy-link: re-measure under global font; edit only if Δ appears.
- Flag flow-driven heights `RE-VERIFY@P7`.

## Architecture

- Presentational Tailwind adjustments. Keep `"use client"` boundaries (`kudos-page-client`,
  interactive spotlight/carousel) intact. Data flow (dictionary + mock posts → components) unchanged.
- Banner background image is owned by the crop pipeline (P2 territory) — reference, do not swap.

## Related Code Files

- **Modify:** the `file_ownership` list (className/JSX spacing only; behavior untouched).
- **Read for context:** `references/measurement-method.md`, `lib/kudos/kudos-types.ts` (data shape),
  existing `mm:<nodeId>` comments; do NOT edit `compose/**`, `open-gift-button.tsx`, `avatar.tsx`,
  `kudos-image-gallery.tsx`.
- **Delete:** none.

## Implementation Steps

1. `list_frames` → identify live-board + spotlight screenIds; `get_frame`/`get_node` per component.
2. Per component group: diff table → fix Δ → re-measure to Δ 0.
3. `kudos-card` group: re-measure under Montserrat; edit only on confirmed drift.
4. Split any file crossing 200 lines during a fix.
5. Update only style-coupled test assertions; behavior/aria assertions untouched.
6. `npx tsc --noEmit` + `npx eslint app/components/kudos app/kudos` + `npx vitest run app/components/kudos`
   (exclude compose already-green subset is fine; must not regress it).

## Todo List

- [ ] live-board + spotlight screenIds enumerated
- [ ] board shell + page-client layout Δ 0
- [ ] banner Δ 0 (KV asset untouched)
- [ ] sidebar + stats-box + filters Δ 0
- [ ] all-kudos-feed + highlight-carousel Δ 0
- [ ] recent-gift-recipients Δ 0
- [ ] spotlight board + name-cloud + ticker Δ 0
- [ ] kudos-card group re-verified under font
- [ ] flow-driven heights flagged RE-VERIFY@P7
- [ ] tsc + eslint + vitest green (compose/secret-box not regressed)

## Success Criteria

- Every tracked kudos node matches `get_node` (Δ 0). All kudos behavior (filter/carousel/search/
  copy-link/like) still works.
- All pre-existing kudos tests pass, including the already-green compose/secret-box suites.
- No kudos component exceeds 200 lines.

## Risk Assessment

| Risk | Likelihood | Impact | Countermove |
|------|-----------|--------|-------------|
| Editing P2/compose/secret-box files (shared) | Med | High | Ownership list excludes them; read-only |
| Regressing board/carousel/spotlight behavior | Med | High | Style-only diffs; existing behavior tests must stay green |
| Large file group → some cross 200 lines | Med | Low | Split within this phase |
| Re-touching "done" kudos-card unnecessarily | Med | Low | Verify-only; edit only on measured Δ |

## Security Considerations

None — presentational; no auth/route/data-mutation change.

## Next Steps

Feeds P7 (full-site re-verify with font + images active).
</content>
