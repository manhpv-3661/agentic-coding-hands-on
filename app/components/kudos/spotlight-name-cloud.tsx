/**
 * Static CSS-positioned name cloud for the Spotlight Board (FR-10). No
 * canvas/word-cloud engine (clarifications.md — none exists in this
 * repo's deps, out of scope for a mock project): each name gets a
 * deterministic position/size derived from its index, so the layout is
 * stable across renders (no physics, no measuring).
 *
 * Position is a golden-angle (≈137.5°) spiral rather than a small fixed
 * slot table: a fixed 12-slot table repeating via `index % 12` put every
 * pair of names 12 apart at the EXACT same pixel (confirmed via
 * `getBoundingClientRect` — e.g. names at index 0 and 12 both landed on
 * `top:8%,left:12%`), rendering as illegibly stacked text once the list
 * passed 12 entries. The golden angle gives every index a distinct
 * angle+radius combination with no repeat period.
 *
 * The angle alone does NOT prevent visual overlap between adjacent names —
 * two nearby indices can still land close together with different text
 * lengths/sizes and visibly collide. `layoutNames` (see
 * `spotlight-name-cloud-layout.ts`) fixes this with a real (if
 * approximate) collision check, including a fallback for when radius
 * growth saturates against the box's clamp bounds and gets trapped
 * repeating the same candidate.
 *
 * The vertical range spans virtually the full box height (~3%-95%, small
 * margins only), matching MoMorph ground truth: the design's name-TEXT
 * nodes scatter from ~9% to ~108% (clipped) of the frame's own height,
 * deliberately overlapping `SpotlightTicker`'s band (~75%-96%, sibling in
 * `spotlight-board.tsx`, now sized to fill the card's remaining height).
 * The ticker's bold, opaque 14px text stays legible over the faint 6-11px
 * name texture at that overlap, so the overlap is intentional design
 * texture, not a bug to avoid.
 *
 * Pure presentational.
 */

import { layoutNames } from "./spotlight-name-cloud-layout";

export interface SpotlightNameCloudProps {
  names: string[];
  /** Current search query — non-empty highlights matching names, dims the
   * rest (FR-10 "làm nổi tên khớp"). Case-insensitive substring match. */
  query: string;
  /** Decorative Pan/Zoom toggle state — flips a scale wrapper class only,
   * no real pan gesture/transform engine. */
  panZoom: boolean;
}

/** Ground truth (`B.7_Spotlight`, screen MaZUn5xHXZ) bakes exactly ONE
 * name-cloud text node (2940:14198, "Nguyễn Hoàng Linh") in a coral accent
 * fill (`rgba(241,118,118,1)`, ~#F17676) — every other of the 106 sibling
 * name nodes, including other occurrences of that same string, render
 * white. It's a single baked instance, not a rule keyed on name content or
 * font size (confirmed: two other nodes share that name's exact 11.339px
 * size and are still white). This component takes a data-driven `names`
 * list with no guarantee "Nguyễn Hoàng Linh" is ever present, so matching
 * by literal string would both miss the accent for most real data and
 * risk mis-coloring an unrelated Sunner who happens to share that name.
 * Pinning the accent to a fixed slot index (first name, deterministic
 * across renders like the rest of this layout) reproduces the "exactly one
 * accented name in the texture" visual without coupling to specific name
 * strings — an arbitrary-but-documented call since the design ties the
 * accent to one baked instance rather than any derivable rule. */
const ACCENT_NAME_INDEX = 0;

export function SpotlightNameCloud({ names, query, panZoom }: SpotlightNameCloudProps) {
  const normalizedQuery = query.trim().toLowerCase();
  const slots = layoutNames(names);

  return (
    <div
      className={`relative w-full flex-1 min-h-0 overflow-hidden transition-transform duration-300 ${panZoom ? "scale-105" : "scale-100"}`}
    >
      {names.map((name, index) => {
        const slot = slots[index];
        const isMatch = normalizedQuery.length > 0 && name.toLowerCase().includes(normalizedQuery);
        const isDimmed = normalizedQuery.length > 0 && !isMatch;
        const isAccent = index === ACCENT_NAME_INDEX;

        return (
          <span
            key={`${name}-${index}`}
            data-matched={isMatch}
            className={`absolute font-montserrat font-bold whitespace-nowrap transition-colors duration-150 ${slot.size} ${
              isMatch ? "text-[#FFEA9E]" : isDimmed ? "text-white/20" : isAccent ? "text-[#F17676]" : "text-white"
            }`}
            // `layoutNames`' collision math (halfWidthPct/halfHeightPct) treats
            // (top, left) as the box's CENTER, not its top-left corner. The
            // `-translate(-50%, -50%)` centering here makes the rendered DOM
            // anchor match that model — without it, unequal-size name pairs
            // (see `pickSize`) can pass the collision check yet still visibly
            // overlap once rendered top-left-anchored.
            style={{ top: slot.top, left: slot.left, transform: "translate(-50%, -50%)" }}
          >
            {name}
          </span>
        );
      })}
    </div>
  );
}
