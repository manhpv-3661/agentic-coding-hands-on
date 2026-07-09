# Phase 02 — Spotlight overlay regression fix

## Context Links
- Audit: `plans/reports/audit-260709-1522-kudos-i18n-and-features.md` → "Spotlight Boards — REGRESSION đang dở tay"
- File (gutted, uncommitted): `app/components/kudos/spotlight-board.tsx`
- Last-known-good: `git show HEAD:app/components/kudos/spotlight-board.tsx`
- Deleted backdrop (its doc-comment documents the exact defect): `git show HEAD:app/components/kudos/spotlight-collage-backdrop.tsx`
- Data: `lib/kudos/kudos-spotlight-data.ts` (`SPOTLIGHT_TOTAL = 388`, `SPOTLIGHT_NAMES`, `SPOTLIGHT_TICKER_ROWS`)
- Subcomponents (still present): `spotlight-name-cloud.tsx`, `spotlight-ticker.tsx`
- Asset (untracked): `public/kudos/spotlight/spotlight.jpg`
- Asset rule: `.claude/rules/momorph/momorph-layout-system.md` (background layers decorative-only; text/interactive content must be DOM)
- MoMorph: `https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ`, section `B.7_Spotlight` (node `2940:14174`)

## Why the stated approach changed — read before coding
Live MoMorph data + direct inspection of `spotlight.jpg` were pulled. **`spotlight.jpg` is NOT a photo-only collage backdrop.** It is the **ENTIRE board flattened into one image** — the "388 KUDOS" counter, the "Tìm kiếm" search pill, all ~110 sunner names, the 6 ticker lines, AND the pan/zoom expand icon are ALL baked into the pixels.

This is the **exact defect commit `b7a363c` already fixed once**: the deleted `spotlight-collage-backdrop.tsx` doc-comment records that a prior `public/kudos/spotlight-crop.png` was "a flattened screenshot of the whole board with ~120 interactive names baked into the pixels… doubled every name… violated the asset rule." The new `spotlight.jpg` is that same flattened screenshot under a new path. The working-tree change re-introduced the regression. Layering the DOM overlay on top of it double-renders every text element — not acceptable.

Live design ground truth (source of truth): `B.7_Spotlight`'s background is a **stack of blended PHOTO layers** (`image 24` `2940:14178`, `image 25` `2940:14181` blend-mode screen, `Root further mo rong 1` `2940:14173` darkened base) with the counter/search/names/ticker/pan-zoom as **separate LIVE DOM/text layers on top**. Names are live text nodes, not baked. Correct model = decorative photo backdrop (no text) + DOM overlay.

## ✅ RESOLVED (user decision) — fresh photo-only export; CSS reconstruction only as fallback
Pull a **fresh text-free / photo-only backdrop** from MoMorph and use it as an `aria-hidden` background layer, then restore the full DOM overlay on top. Do NOT ship the flattened `spotlight.jpg`. Do NOT default to the CSS gradient reconstruction — the real photo replaces it; CSS is only the last-resort fallback if no clean photo layer is exportable.

Primary path (do this first): fetch the real background photo layer via `mcp__momorph__get_frame_image` / `mcp__momorph__get_media_file` / `mcp__momorph__list_media_items` (fileKey `9ypp4enmFmdK3YAFJLIu6C`, screen `MaZUn5xHXZ`, section `B.7_Spotlight`). Target the actual background photo layer(s) — `image 24` (`2940:14178`), `image 25` (`2940:14181`), `Root further mo rong 1` (`2940:14173`) — NOT the flattened composite. Save under `public/kudos/spotlight/`, replacing the baked `spotlight.jpg`.

Documented fallback (ONLY if the API exposes only the flattened composite, no clean photo-only layer): restore the CSS-only `spotlight-collage-backdrop.tsx` reconstruction from HEAD. If this fallback is taken, **write an explicit note in this phase file recording that the photo-only export was unavailable and why** — never silently reuse the baked image.

## Overview
- Priority: P2
- Status: pending (unblocked — decisions resolved)
- Restore the deleted DOM overlay (search input, `{total}` counter, `SpotlightNameCloud`, `SpotlightTicker`, pan/zoom button) — essentially the HEAD version — over a **fresh photo-only MoMorph backdrop**. Keep pan/zoom decorative (no lightbox — confirmed absent from design).

## Key Insights (from live MoMorph fetch)
- **Pan/zoom = decorative only.** `B.7.2_Pan zoom` (`3007:17479`) is a bare 30x30 icon frame with no linked overlay/modal. Listed 200+ frames in the file: NO zoomed-spotlight/lightbox/enlarge variant exists anywhere. A click-to-enlarge lightbox would be an INVENTION, not a design match → keep the current decorative scale-toggle behavior (or a pure no-op affordance); do NOT build a lightbox.
- **Counter** `B.7.1` (`3007:17482`): text "388 KUDOS", Montserrat 700, 36px/44px, white. Matches `SPOTLIGHT_TOTAL = 388`.
- **Name-cloud**: ~110 live TEXT nodes (7 distinct names repeated) — already reproduced by `spotlight-name-cloud.tsx` + `SPOTLIGHT_NAME_SLOTS`. Live DOM, not baked.
- **Ticker**: 6 stacked lines "{time} {name} đã nhận được một Kudos mới" with top-to-bottom opacity 0.1→1 — already reproduced by `spotlight-ticker.tsx`.
- **Search pill** `B.7.3` (`2940:14833`): 219x39, translucent gold, radius 46.4px, magnifier icon + input, placeholder "Tìm kiếm".
- The subcomponents (`spotlight-name-cloud.tsx`, `spotlight-ticker.tsx`) and data (`kudos-spotlight-data.ts`) still exist untouched — only `spotlight-board.tsx` was gutted and `spotlight-collage-backdrop.tsx` deleted.
- Dictionary keys already exist (`kudos.spotlight.searchPlaceholder|panZoom|tickerSuffix`) — NO new dictionary keys needed for this phase (title comes from Phase 01's `kudos.sections.spotlightBoard`).

## Requirements
Functional:
- Restore DOM overlay: functional search input (filters name-cloud, `SEARCH_MAX_LENGTH=100`), `{total} KUDOS` counter, `SpotlightNameCloud`, `SpotlightTicker`, pan/zoom button.
- Backdrop is decorative and text-free (no baked names/counter/ticker/search/icon).
- Section title from dictionary (Phase 01 dependency: `dict.kudos.sections.spotlightBoard`).
- Pan/zoom stays a decorative affordance — NO lightbox.

Non-functional:
- Accessibility preserved: real `<input>`, aria-labels, selectable DOM text (asset rule).
- Layout matches the numeric contract from HEAD (h-137/548px, radius 47px, border #998C5F, documented offsets) — reuse HEAD's measured values.
- No double-rendered text.

## Architecture / Data flow
`page.tsx`/board (server) → `SpotlightBoard names={SPOTLIGHT_NAMES} total={SPOTLIGHT_TOTAL} labels={...}` (unchanged) → client component renders decorative backdrop (z-0) + overlay (search/counter/name-cloud/ticker/pan-zoom). Search state stays local (`useState query`); name-cloud filters on it. No new data source.

## Backdrop source — decided (photo-only export; CSS fallback)
- **Chosen: fresh PHOTO-ONLY export from MoMorph.** Fetch the background photo layer(s) — `image 24` (`2940:14178`), `image 25` (`2940:14181`), `Root further mo rong 1` (`2940:14173`) — via `mcp__momorph__list_media_items` (enumerate the media in the file), then `mcp__momorph__get_media_file` / `mcp__momorph__get_frame_image` to pull the actual image asset. Save as an `aria-hidden` `absolute inset-0 z-0` decorative bg under `public/kudos/spotlight/`, replacing the baked `spotlight.jpg`. Frame reads already succeed via MCP, so the earlier auth 500/401 (noted in the deleted file's comment) may now be resolved — but the export endpoint is distinct, so verify it actually returns a text-free image.
- **Fallback (only if no clean photo-only layer is exportable — API returns only the flattened composite): restore the CSS-only `SpotlightCollageBackdrop`** (`git checkout HEAD -- app/components/kudos/spotlight-collage-backdrop.tsx`) as the decorative backdrop, and delete the flattened `spotlight.jpg`. Record the limitation explicitly in this file.
- **NOT acceptable under any path:** using the flattened `spotlight.jpg` as the visible backdrop under the DOM overlay (double text = the `b7a363c` regression).

## Related Code Files
Modify:
- `app/components/kudos/spotlight-board.tsx` — restore HEAD's overlay JSX (search pill, counter, `SpotlightNameCloud`, `SpotlightTicker`, pan/zoom button); backdrop per chosen option; title wired from Phase 01 dictionary key
Create/replace (chosen path):
- New text-free photo-only backdrop asset under `public/kudos/spotlight/` (replaces the baked `spotlight.jpg`) — no code file
Restore ONLY if fallback triggered:
- `app/components/kudos/spotlight-collage-backdrop.tsx` (`git checkout HEAD -- app/components/kudos/spotlight-collage-backdrop.tsx`)
Delete:
- The flattened baked `public/kudos/spotlight/spotlight.jpg` (replaced on the chosen path, removed on the fallback path)
Do NOT touch: `spotlight-name-cloud.tsx`, `spotlight-ticker.tsx`, `kudos-spotlight-data.ts` (already correct).

## Ownership / dependency note
- `spotlight-board.tsx` line 52 also needs the Phase 01 `title` prop wiring. To avoid two agents editing this file: **Phase 02 owns `spotlight-board.tsx` end-to-end** and does the title wiring itself using Phase 01's dictionary key (`kudos.sections.spotlightBoard`). Phase 01 must NOT edit `spotlight-board.tsx`; it only adds the key. Coordinate the key name up front.

## Implementation Steps
1. Diff current vs `git show HEAD:app/components/kudos/spotlight-board.tsx`; take HEAD's overlay JSX as the baseline.
2. Fetch the photo-only backdrop: `mcp__momorph__list_media_items` (fileKey `9ypp4enmFmdK3YAFJLIu6C`) → identify the `image 24`/`image 25`/`Root further mo rong 1` background layers → `mcp__momorph__get_media_file`/`get_frame_image` to pull the asset. Verify by eye it is text-free (no names/counter/ticker/search baked in). Save under `public/kudos/spotlight/`, replacing `spotlight.jpg`. If only the flattened composite is available, take the fallback (restore CSS `SpotlightCollageBackdrop`) and document why here.
3. Rebuild `spotlight-board.tsx`: `aria-hidden` decorative backdrop (z-0, the new photo or the CSS fallback) + restored DOM overlay. Wire `title` from `dict.kudos.sections.spotlightBoard` (Phase 01).
4. Keep pan/zoom as the decorative toggle (no lightbox).
5. Confirm the baked `spotlight.jpg` is replaced (chosen path) or deleted (fallback path) — never referenced as-is.
6. `tsc --noEmit` + lint. Playwright at 1440: overlay visible ONCE over the photo, names not doubled, search filters, counter shows 388, ticker fades, title renders once.

## Todo List
- [ ] Baseline from HEAD spotlight-board.tsx
- [ ] Fetch text-free photo-only backdrop from MoMorph (verify no baked text); fallback to CSS reconstruction + document if unavailable
- [ ] Restore search pill (functional input)
- [ ] Restore `{total} KUDOS` counter
- [ ] Restore `SpotlightNameCloud`
- [ ] Restore `SpotlightTicker`
- [ ] Restore pan/zoom button (decorative, no lightbox)
- [ ] Wire title from Phase 01 dictionary key
- [ ] Remove/replace flattened `spotlight.jpg`
- [ ] `tsc --noEmit` + lint + 1440 visual (no doubled text)

## Success Criteria
- All overlay elements render once as live DOM over a text-free decorative backdrop.
- No baked text anywhere (grep confirms no `bg-[url('/kudos/spotlight/spotlight.jpg')]` unless the asset is verified text-free).
- Search filters the name-cloud; counter = 388; ticker present; pan/zoom decorative.
- Accessibility intact (real input, aria-labels, selectable text).
- Layout matches HEAD's numeric contract (548px, radius 47, offsets).

## Risk Assessment
- **High:** shipping `spotlight.jpg` as-is re-introduces the `b7a363c` baked-text defect. Countermove: Q1 gate; backdrop must be text-free; verify by eye before merge.
- Medium: MoMorph photo-only export may still 401/500 (credential gap). Countermove: Option B (CSS backdrop) is a proven fallback.
- Low: title-prop coordination with Phase 01. Countermove: Phase 02 owns the file; agree the key name first.

## Decisions (RESOLVED — no blockers)
1. **Backdrop source:** fresh photo-only MoMorph export replaces `spotlight.jpg`; CSS `SpotlightCollageBackdrop` restored ONLY as a documented fallback if no clean photo layer is exportable. The flattened `spotlight.jpg` is never used as-is. (User, 2026-07-09.)
2. **Pan/zoom:** stays decorative — no lightbox (confirmed absent from design). (User, 2026-07-09.)

## Unresolved
- None blocking. One runtime contingency: whether the MoMorph media API exposes a clean photo-only layer vs only the flattened composite — resolved during Step 2, with the CSS fallback pre-authorized.

## Fallback taken (implementer, 2026-07-09)
Photo-only export was **not available** — took the CSS fallback. Verified during implementation:
- `mcp__momorph__get_media_file` (fileKey `9ypp4enmFmdK3YAFJLIu6C`) for nodes `2940:14178` (`image 24`) and `2940:14181` (`image 25`) both returned `401 Unauthorized` on the file's `/media` endpoint.
- `mcp__momorph__get_figma_image` for the same nodes (individually and as a pair, png and jpg, retried twice) returned `500` every time.
- `mcp__momorph__get_media_file`/`get_figma_image` for `2940:14173` (`Root further mo rong 1`) failed the same way.
- `mcp__momorph__list_media_items`/`list_media_nodes` don't surface these three nodes at all (they're plain `RECTANGLE`s with image fills, not `MM_MEDIA_*`-tagged assets) — no alternate ID to fetch them by.
- `mcp__momorph__get_frame_image` (whole-screen render) succeeds, but it rasters the ENTIRE page including the live counter/search/name-cloud/ticker text baked as pixels — using any crop of it as the backdrop would reintroduce the exact double-text regression this phase fixes, so it's not usable as a substitute for the isolated background layer.
- Conclusion: this is the same "credential gap, not a code issue" the deleted `spotlight-collage-backdrop.tsx` doc-comment already recorded for these exact three node IDs — still unresolved as of this fix. Restored the CSS-only `SpotlightCollageBackdrop` (`git checkout HEAD -- app/components/kudos/spotlight-collage-backdrop.tsx`) as the decorative backdrop and deleted the flattened `public/kudos/spotlight/spotlight.jpg`. Follow-up: once MoMorph image-export auth is fixed, swap in the real `image 24`/`image 25`/`Root further mo rong 1` exports per the CSS component's own `FOLLOW-UP` doc-comment.
