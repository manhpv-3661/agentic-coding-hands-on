"use client";

import { useState } from "react";
import { KudosSectionHeading } from "./kudos-section-heading";
import { SpotlightCollageBackdrop } from "./spotlight-collage-backdrop";
import { SpotlightNameCloud } from "./spotlight-name-cloud";
import { SpotlightTicker } from "./spotlight-ticker";

export interface SpotlightBoardLabels {
  searchPlaceholder: string;
  panZoom: string;
  /** "đã nhận được một Kudos mới" — bottom ticker suffix (MoMorph §2). */
  tickerSuffix: string;
}

export interface SpotlightBoardProps {
  names: string[];
  total: number;
  labels: SpotlightBoardLabels;
}

const SEARCH_MAX_LENGTH = 100;

/** Magnifier icon on the Spotlight search pill (`MM_MEDIA_Search`, node
 * I2940:14833;186:2759, 16x16px per the design) — currentColor inline SVG,
 * mirroring the sibling "Tìm kiếm profile Sunner" pill's own `SearchIcon`
 * in `kudos-banner.tsx`, sized down to this pill's 16px icon. */
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M13.5 13.5L10.5 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * "SPOTLIGHT BOARD" section (FR-9/10/11). Self-contained client section:
 * owns its OWN search + Pan/Zoom state, independent of the shared
 * hashtag/department filter (Phase 08's `kudos-board.tsx`) — isolated per
 * Phase 06's Key Insights, safe to build/test/run in parallel with
 * Highlight (05) and All Kudos (07).
 *
 * "{total} KUDOS" is the static `SPOTLIGHT_TOTAL` counter, NOT a count of
 * rendered names (clarifications.md).
 */
export function SpotlightBoard({ names, total, labels }: SpotlightBoardProps) {
  const [query, setQuery] = useState("");
  const [panZoom, setPanZoom] = useState(false);

  return (
    <section className="flex w-full flex-col gap-6">
      <KudosSectionHeading subtitle="Sun* Annual Awards 2025" title="SPOTLIGHT BOARD" />

      {/* Board frame (`B.7_Spotlight`, node 2940:14174): radius 47.14px,
       * border 1px #998C5F, and a hard `height: 548px` in the design (not
       * auto-sized from content) — `h-137` (137 * 4px = 548px) reproduces that explicitly
       * instead of letting the card shrink to whatever its flow children
       * add up to. Without it the card rendered ~23% shorter than the
       * design because the ticker and Pan/Zoom button are absolutely
       * positioned (no flow/height contribution) while the name-cloud was
       * pinned to a fixed 320px box, well short of the design's
       * near-full-height name texture. `overflow-hidden` clips the
       * oversized photo-collage backdrop below to this radius. */}
      <div className="relative flex h-137 w-full flex-col gap-4 overflow-hidden rounded-[47px] border border-[#998C5F] p-6">
        {/* The exact Figma collage export is unavailable here, so the backdrop
         * is reconstructed from the shipped mock photos: a low-contrast grid
         * layer + a handful of larger portrait/photo tiles under the same 70%
         * black overlay the design uses. */}
        <SpotlightCollageBackdrop />

        <div className="relative flex flex-wrap items-center gap-4">
          {/* Search pill (`B.7.3_Tìm kiếm sunner`, node 2940:14833): wraps the
           * `MM_MEDIA_Search` 16x16 magnifier icon before the label/input,
           * same icon-then-text pill chrome as the sibling "Tìm kiếm profile
           * Sunner" pill in `kudos-banner.tsx` — that pill is a disabled
           * `<button>` (no search feature in scope there), this one is a real
           * functional filter input, so the icon sits alongside the input
           * inside one bordered container instead of a bare `<input>`. */}
          {/* Ground truth (`Frame 483`, I2940:14833;186:2758): icon-to-text
           * `gap: 10.918635px`, and outer pill (`B.7.3_Tìm kiếm sunner`,
           * 2940:14833) `padding: 16.378px 10.919px` — but the pill here has
           * no fixed height (unlike the design's hard 39px box), so
           * `align-items: center` on a fixed-height flex container makes the
           * *literal* vertical padding value cancel out of the final
           * position; what actually reproduces the measured 39px box is the
           * pill's real vertical inset, (39 - 17) / 2 = 11px, not the raw
           * 16.378px (double-counting that would overshoot to ~51px tall).
           * Horizontal inset (10 measured, ~10.919 declared) matches the
           * declared padding literally since flex-start doesn't cancel it
           * the same way. `px-[10.919px] py-2.75` (11px) reproduces both. */}
          <div className="flex items-center gap-[10.919px] rounded-full border border-[#998C5F] bg-[rgba(255,234,158,0.10)] px-[10.919px] py-2.75 text-white/70">
            <SearchIcon />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value.slice(0, SEARCH_MAX_LENGTH))}
              maxLength={SEARCH_MAX_LENGTH}
              placeholder={labels.searchPlaceholder}
              aria-label={labels.searchPlaceholder}
              // Ground truth (text node `I2940:14833;186:2760`): fontSize
              // 10.918635px, fontWeight 500, letterSpacing 0.102362px, fill
              // rgba(255,255,255,1) — Tailwind's default `text-sm` (14px/400/0)
              // was ~28% oversized with no tracking, and `placeholder:text-white/40`
              // dimmed the placeholder to 60% brightness against the design's
              // fully-opaque white for the same "Tìm kiếm" label text.
              className="bg-transparent text-[10.919px] font-medium tracking-[0.102px] text-white placeholder:text-white focus:outline-none"
            />
          </div>

          {/* MoMorph `B.7.1_388 KUDOS` (3007:17482): 36px/44px, white fill,
           * centered at the frame's own horizontal midpoint (design startX
           * 612/endX 829 -> midpoint 720.5, exactly matching the
           * `B.7_Spotlight` frame's midpoint 720.5) — independent of the
           * search pill's width/position, not placed relative to it via
           * `justify-between`. Vertically it is its own independent
           * absolute-positioned sibling too, not centered against the
           * pill: design top offsets from the frame (counter 1672-1658=14px
           * vs. pill 1684-1658=26px) put the counter's top 12px ABOVE the
           * pill's top, i.e. its center sits ~9.5px above the pill's
           * center. The row's own top edge coincides with the pill's top
           * (the input is the row's only flow child), so `-top-3` (-12px)
           * anchored to the row's top reproduces that offset instead of
           * `top-1/2 -translate-y-1/2` (which centers on the pill). */}
          <p className="absolute -top-3 left-1/2 -translate-x-1/2 font-montserrat text-[36px] leading-11 font-bold text-white">
            {total} KUDOS
          </p>
        </div>

        <SpotlightNameCloud names={names} query={query} panZoom={panZoom} />
        <SpotlightTicker suffix={labels.tickerSuffix} />

        {/* MoMorph `B.7.2 Pan zoom` (3007:17479): a bare 30x30 icon frame
         * (no text child) isolated near the board's bottom-right corner
         * (~94% across, ~86% down) — not grouped with the search/counter
         * row. `aria-label` keeps the accessible name text-based even
         * though the visible control is icon-only.
         *
         * Offset from the frame's outer border edge: design right =
         * 1299-1261 = 38px, bottom = 2206-2159 = 47px (nodes `2940:14174`
         * / `3007:17479`). This button's containing block is the
         * `relative` ancestor's PADDING edge (the 1px border is excluded
         * per CSS spec), so `right-9.25`/`bottom-11.5` (37px/46px = 38/47
         * minus the 1px border) reproduces the true 38px/47px offset from the
         * frame's visible outer edge — `right-6`/`bottom-6` (24px) sat
         * ~13px/~22px too close to the corner. */}
        <button
          type="button"
          onClick={() => setPanZoom((current) => !current)}
          aria-pressed={panZoom}
          aria-label={labels.panZoom}
          className={`absolute right-9.25 bottom-11.5 flex h-7.5 w-7.5 items-center justify-center rounded-full border transition-colors duration-150 ${
            panZoom
              ? "border-[#FFEA9E] text-[#FFEA9E]"
              : "border-white/20 text-white/70"
          }`}
        >
          {/* Ground truth (3007:17479) is a single diagonal double-headed
           * "expand" arrow (⤢-style: one shaft from bottom-left to
           * top-right with a chevron arrowhead at each end), NOT four
           * separate corner brackets — the previous `M1 5V1h4...` path drew
           * a "maximize" glyph (one open L per corner of the whole
           * 16x16 box), which is a visually distinct silhouette. */}
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
            <path
              d="M4 12L12 4M8 4H12V8M8 12H4V8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
