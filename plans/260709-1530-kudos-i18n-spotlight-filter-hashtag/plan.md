---
title: "Kudos i18n gaps + Spotlight fix + filter styling + hashtag upgrade"
description: "Four scoped fixes on the Sun* Kudos board: close i18n hardcode gaps, restore the gutted Spotlight overlay, fix invisible filter text, and add a hashtag catalog dropdown + group preset."
status: pending
priority: P2
effort: 9h
branch: main
tags: [kudos, i18n, spotlight, hashtag, momorph, bugfix]
created: 2026-07-09
---

# Kudos: i18n gaps + Spotlight fix + filter styling + hashtag upgrade

Fix/small-feature work on the Sun* Kudos board. Ground truth: `plans/reports/audit-260709-1522-kudos-i18n-and-features.md` (exact file:line evidence). Scope was pre-confirmed by the user — do NOT re-litigate the "no-change" items (per-user stats, top-10-recent-gifts, hardcoded `<title>`).

## Phases

| # | Phase | Status | Effort | Depends on |
|---|-------|--------|--------|------------|
| 01 | [i18n hardcode gaps](phase-01-i18n-hardcode-gaps.md) | pending | 3h | — |
| 02 | [Spotlight overlay regression fix](phase-02-spotlight-overlay-fix.md) | pending | 2.5h | — |
| 03 | [Filter select styling bug](phase-03-filter-select-styling.md) | pending | 0.5h | — |
| 04 | [Hashtag catalog dropdown + group preset](phase-04-hashtag-catalog-upgrade.md) | pending | 3h | — |

## Parallelization / File ownership

All four phases touch disjoint files and can run in parallel. One shared file needs a merge rule:

- `lib/i18n/dictionaries/{en,vi}.ts` — Phase 01 (primary owner), Phase 04 (appends `compose.hashtags.*` catalog keys). If run in parallel, Phase 01 owns the file and Phase 04 hands its key set to Phase 01 to insert; if sequential, Phase 04 appends after Phase 01. Never edit the dictionaries in two agents at once.
- `app/components/kudos/kudos-section-heading.tsx` — Phase 01 only.
- `app/components/kudos/spotlight-board.tsx` — Phase 02 only (also reads dictionary keys added by Phase 01, but does not edit the dictionary).
- `app/components/kudos/kudos-filters.tsx` — Phase 03 only.
- `app/components/kudos/compose/hashtag-input.tsx` + new catalog file — Phase 04 only.

Cross-phase note: Phase 01 adds the dictionary keys for the section headings AND the Spotlight labels are already present (`kudos.spotlight.*`), so Phase 02 does not need new dictionary keys — it re-wires existing ones. Confirm before starting Phase 02.

## Key dependencies

- MoMorph MCP is the design source of truth (screens `MaZUn5xHXZ`, `JsTvi8KVQA`, `RO7O6QOhfJ` in file `9ypp4enmFmdK3YAFJLIu6C`). Phase 02 (lightbox question) and Phase 04 (hashtag catalog values) MUST pull live frame data via `get_frame`/`get_frame_node_tree`/`get_node` before finalizing — see each phase's Key Insights for the resolved findings.
- `satisfies Dictionary` in `en.ts`/`vi.ts` is the compile-time parity guard — every new key must be added to BOTH files or `tsc --noEmit` fails.
- Current asset `public/kudos/spotlight/spotlight.jpg` (untracked, 504KB) is the fully-flattened MoMorph export (text baked in) — per the resolved decision below, Phase 02 REPLACES it with a fresh photo-only backdrop export before layering the DOM overlay on top; the deleted `spotlight-collage-backdrop.tsx` stays deleted unless Phase 02's fallback path is triggered.

## Validation (whole plan)

- `npx tsc --noEmit` clean (dictionary parity guard).
- `npm run lint` clean on touched files.
- Manual/Playwright at 1440 viewport: section titles render once (not twice, not zero times), Spotlight overlay visible over the photo, filter text legible, hashtag dropdown + group preset functional.
- Tests are a LATER separate pass (per user's standing preference) — do not add/update tests inside these phases unless a phase explicitly says so.

## Decisions (both prior blockers RESOLVED — all phases unblocked)

Live MoMorph frame data was pulled (source of truth per `momorph-layout-system.md`) and contradicted the stated scope on two items. Both resolved by the user (2026-07-09):

1. **Phase 02 backdrop — RESOLVED:** `spotlight.jpg` is the whole board flattened (counter + search + names + ticker + pan/zoom icon baked in) — using it under the DOM overlay double-renders text (the `b7a363c` defect). Decision: pull a fresh **photo-only** MoMorph backdrop export (via `mcp__momorph__list_media_items` / `get_media_file` / `get_frame_image`), replacing `spotlight.jpg`; restore the DOM overlay on top. CSS `SpotlightCollageBackdrop` restored ONLY as a documented fallback if no clean photo layer is exportable. Pan/zoom stays decorative (no lightbox).
2. **Phase 04 hashtag upgrade — RESOLVED:** the live design has NO dropdown/checklist/group (current free-text+chip+max-5 already matches it). Decision: build the upgrade anyway (user override). Data source = hardcoded `lib/kudos/kudos-hashtag-catalog.ts` (mirrors `award-categories-fallback.ts`), NOT Supabase. Catalog + group content is INVENTED placeholder (design mock chips + culture-language extras), flagged in-file for later swap. Free-text entry preserved; dropdown is additive.

Non-blocking: Phase 01 VI heading casing/wording; Phase 03 exact hover treatment. See phase files.

All four phases are unblocked. 01 and 03 have no external dependency; 02 and 04 need MoMorph MCP + the resolved decisions above.
