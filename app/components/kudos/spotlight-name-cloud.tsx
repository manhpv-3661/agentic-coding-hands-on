/**
 * Static CSS-positioned name cloud for the Spotlight Board (FR-10). No
 * canvas/word-cloud engine (clarifications.md — none exists in this
 * repo's deps, out of scope for a mock project): each name gets a
 * deterministic position/size derived from its index, so the layout is
 * stable across renders (no physics, no measuring).
 *
 * Pure presentational.
 */

export interface SpotlightNameCloudProps {
  names: string[];
  /** Current search query — non-empty highlights matching names, dims the
   * rest (FR-10 "làm nổi tên khớp"). Case-insensitive substring match. */
  query: string;
  /** Decorative Pan/Zoom toggle state — flips a scale wrapper class only,
   * no real pan gesture/transform engine. */
  panZoom: boolean;
}

/** A small, fixed set of deterministic position/size "slots" the names
 * cycle through by index — enough variety to read as a scattered cloud
 * without any per-name randomness (stable snapshots, no hydration
 * mismatch). */
const SLOTS: Array<{ top: string; left: string; size: string }> = [
  { top: "8%", left: "12%", size: "text-lg" },
  { top: "18%", left: "55%", size: "text-2xl" },
  { top: "30%", left: "28%", size: "text-sm" },
  { top: "42%", left: "70%", size: "text-xl" },
  { top: "12%", left: "80%", size: "text-base" },
  { top: "55%", left: "10%", size: "text-2xl" },
  { top: "62%", left: "45%", size: "text-sm" },
  { top: "70%", left: "68%", size: "text-lg" },
  { top: "25%", left: "5%", size: "text-base" },
  { top: "48%", left: "35%", size: "text-xl" },
  { top: "78%", left: "22%", size: "text-sm" },
  { top: "5%", left: "40%", size: "text-base" },
];

export function SpotlightNameCloud({ names, query, panZoom }: SpotlightNameCloudProps) {
  const normalizedQuery = query.trim().toLowerCase();

  return (
    <div
      className={`relative h-[320px] w-full overflow-hidden transition-transform duration-300 ${panZoom ? "scale-105" : "scale-100"}`}
    >
      {names.map((name, index) => {
        const slot = SLOTS[index % SLOTS.length];
        const isMatch = normalizedQuery.length > 0 && name.toLowerCase().includes(normalizedQuery);
        const isDimmed = normalizedQuery.length > 0 && !isMatch;

        return (
          <span
            key={`${name}-${index}`}
            data-matched={isMatch}
            className={`absolute font-montserrat font-semibold whitespace-nowrap transition-colors duration-150 ${slot.size} ${
              isMatch ? "text-[#FFEA9E]" : isDimmed ? "text-white/20" : "text-white/70"
            }`}
            style={{ top: slot.top, left: slot.left }}
          >
            {name}
          </span>
        );
      })}
    </div>
  );
}
