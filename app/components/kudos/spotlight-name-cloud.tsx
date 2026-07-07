/**
 * Static CSS-positioned name cloud for the Spotlight Board (FR-10). The
 * production mock dataset is fixed at 24 names, so this screen now uses a
 * fixed slot table rather than a runtime word-cloud algorithm: each shipped
 * name gets one canonical (top, left, size) slot, making the texture stable
 * and audit-friendly.
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

import { SPOTLIGHT_NAME_SLOTS } from "@/lib/kudos/spotlight-name-cloud-slots";

export interface SpotlightNameCloudProps {
  names: string[];
  /** Current search query — non-empty highlights matching names, dims the
   * rest (FR-10 "làm nổi tên khớp"). Case-insensitive substring match. */
  query: string;
  /** Decorative Pan/Zoom toggle state — flips a scale wrapper class only,
   * no real pan gesture/transform engine. */
  panZoom: boolean;
}

export function SpotlightNameCloud({ names, query, panZoom }: SpotlightNameCloudProps) {
  const normalizedQuery = query.trim().toLowerCase();
  const visibleNames = names.slice(0, SPOTLIGHT_NAME_SLOTS.length);

  return (
    <div
      className={`relative w-full flex-1 min-h-0 overflow-hidden transition-transform duration-300 ${panZoom ? "scale-105" : "scale-100"}`}
    >
      {visibleNames.map((name, index) => {
        const slot = SPOTLIGHT_NAME_SLOTS[index];
        const isMatch = normalizedQuery.length > 0 && name.toLowerCase().includes(normalizedQuery);
        const isDimmed = normalizedQuery.length > 0 && !isMatch;
        const isAccent = slot.tone === "accent";

        return (
          <span
            key={`${name}-${index}`}
            data-spotlight-index={index}
            data-matched={isMatch}
            className={`absolute font-montserrat font-bold whitespace-nowrap transition-colors duration-150 ${slot.size} ${
              isMatch ? "text-[#FFEA9E]" : isDimmed ? "text-white/20" : isAccent ? "text-[#F17676]" : "text-white"
            }`}
            style={{ top: slot.top, left: slot.left, transform: "translate(-50%, -50%)" }}
          >
            {name}
          </span>
        );
      })}
    </div>
  );
}
