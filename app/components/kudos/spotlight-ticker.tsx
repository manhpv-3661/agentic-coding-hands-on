/**
 * Bottom ticker inside the Spotlight Board (MoMorph §2 SPOTLIGHT BOARD,
 * nodes `2940:14230` / `3004:15995-15999`): 6 stacked text lines fading
 * downward-to-upward — top line faintest (0.1), bottom line brightest
 * (1) — confirmed by re-fetching all 6 nodes' opacities ordered by Y
 * position (top-to-bottom: 0.1, 0.3, 0.5, 0.7, none/1, none/1).
 *
 * Row pitch: ground-truth nodes sit exactly 19px apart (startY 2068, 2087,
 * 2106, 2125, 2144) with font-size 14px / line-height 20px — i.e. the rows
 * are packed with no extra inter-line gap (`text-sm leading-5` alone
 * already reproduces this; no `gap` utility needed on the flex column).
 *
 * Horizontal inset: ticker text sits 49px inside the `B.7_Spotlight` frame's
 * outer border edge (frame startX 142, text startX 191). The containing
 * block for this `absolute` list is the outer card's padding edge (1px
 * inside the visible border, not its `p-6` padding — same rule the
 * Pan/Zoom button's offset comment documents), so `inset-x-12` (48px =
 * 49px minus the 1px border) reproduces the true 49px inset.
 *
 * Vertical inset: same border-subtraction rule applies here too. Frame
 * `2940:14174`'s outer border-box bottom edge sits at endY 2206; the
 * bottom-most (brightest) ticker row `2940:14230` ends at endY 2186 — a
 * true 20px gap. `bottom-[19px]` (20px minus the 1px border) reproduces
 * that 20px visible offset, matching the same convention already used for
 * the horizontal inset and the Pan/Zoom button's offsets.
 *
 * All 6 ground-truth nodes carry the exact SAME literal line
 * ("08:30PM Nguyễn Bá Chức đã nhận được một Kudos mới") — the design
 * provides no distinct per-row data, same "repeat the design's one literal
 * row" precedent as `RECENT_GIFT_RECIPIENTS`. `SPOTLIGHT_TICKER_ROWS`
 * (`lib/kudos/kudos-spotlight-data.ts`) is the canonical source for this —
 * consumed directly here rather than re-invented locally.
 *
 * Purely decorative — `aria-hidden`, no interactivity.
 */

import { SPOTLIGHT_TICKER_ROWS } from "@/lib/kudos/kudos-spotlight-data";

export interface SpotlightTickerProps {
  /** "đã nhận được một Kudos mới" — dictionary-sourced suffix
   * (`kudos.spotlight.tickerSuffix`). */
  suffix: string;
}

/** Ground-truth Y-ordering is dimmest (top) to brightest (bottom):
 * 0.1, 0.3, 0.5, 0.7, 1, 1. `SPOTLIGHT_TICKER_ROWS` is stored
 * brightest-first ([1, 1, 0.7, 0.5, 0.3, 0.1]), so render it reversed to
 * land in top-to-bottom design order. */
const TICKER_ROWS = [...SPOTLIGHT_TICKER_ROWS].reverse();

export function SpotlightTicker({ suffix }: SpotlightTickerProps) {
  return (
    <ul
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-12 bottom-[19px] flex flex-col"
    >
      {TICKER_ROWS.map((row, index) => (
        <li
          key={index}
          className="font-montserrat text-sm leading-5 font-bold tracking-[0.1px] text-white"
          style={{ opacity: row.opacity }}
        >
          {row.time} {row.name} {suffix}
        </li>
      ))}
    </ul>
  );
}
