/**
 * Spotlight Board mock content (FR-9/10/11), split out of `kudos-data.ts`
 * to keep both files under the 200-line budget — `kudos-data.ts`
 * re-exports all three so `page.tsx`/`spotlight-board.tsx` can keep
 * importing them from the "database" module.
 */

import { SPOTLIGHT_NAME_SLOTS } from "./spotlight-name-cloud-slots";

/** Exact repeated-name texture exported from the real Figma spotlight board. */
export const SPOTLIGHT_NAMES: string[] = SPOTLIGHT_NAME_SLOTS.map((slot) => slot.text);

/** The "388 KUDOS" counter (FR-10) — a number, independent of the rendered
 * name-cloud item count. */
export const SPOTLIGHT_TOTAL = 388;

/**
 * Spotlight Board's bottom fading ticker (design node `2940:14230`,
 * `3004:15995-15999`) — 6 stacked lines, all the SAME literal
 * "{time} {name}" pair from the design frame, fading from opaque (bottom,
 * most recent) to nearly transparent (top) — same "repeat the design's one
 * literal row" precedent as `RECENT_GIFT_RECIPIENTS` (`kudos-data.ts`),
 * since the design provides no distinct per-row data either.
 */
export const SPOTLIGHT_TICKER_ROWS: Array<{ time: string; name: string; opacity: number }> = [
  1, 1, 0.7, 0.5, 0.3, 0.1,
].map((opacity) => ({ time: "08:30PM", name: "Nguyễn Bá Chức", opacity }));
