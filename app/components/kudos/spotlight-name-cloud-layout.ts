/**
 * Layout math for `SpotlightNameCloud` (FR-10), split out to keep both
 * files under the 200-line budget. See that file's header for the full
 * rationale (golden-angle spiral, collision footprint estimate, the
 * clamp-saturation trap, and the `findFreeSlot` escape).
 */

const GOLDEN_ANGLE_DEG = 137.50776;
/** Ground-truth font sizes measured directly off MoMorph node fontSize
 * values for the name-cloud text nodes (screen MaZUn5xHXZ, `B.7_Spotlight`):
 * of 106 name nodes, 97 sit at 6.656px and only 9 range from 7.937px up to
 * 11.339px — a fine, mostly-uniform "wallpaper" texture, not Tailwind's
 * 14-24px `text-sm`..`text-2xl` scale. Arbitrary-value classes reproduce the
 * exact measured px values. */
export const SIZES = [
  "text-[6.656px]",
  "text-[7.937px]",
  "text-[10.205px]",
  "text-[11.339px]",
] as const;
/** Px metrics per size class above, used only to estimate each name's
 * on-screen footprint for collision math. Line-height is an estimate
 * (~1.35x font size, close to Tailwind's own leading-tight ratio) — a
 * mismatch with the real rendered height only makes the safety margin
 * more/less generous, per this file's own footprint-estimate rationale. */
const SIZE_METRICS: Record<string, { fontPx: number; lineHeightPx: number }> = {
  "text-[6.656px]": { fontPx: 6.656, lineHeightPx: 9 },
  "text-[7.937px]": { fontPx: 7.937, lineHeightPx: 11 },
  "text-[10.205px]": { fontPx: 10.205, lineHeightPx: 14 },
  "text-[11.339px]": { fontPx: 11.339, lineHeightPx: 15 },
};
/** Weighted pick matching the ground-truth proportions (97:3:3:3 out of 106
 * nodes ≈ 91.5% smallest, ~2.8% each of the other three sizes) — a plain
 * `index % SIZES.length` cycle would spread names evenly across all four
 * sizes and lose the design's dense, mostly-uniform texture. */
function pickSize(index: number): (typeof SIZES)[number] {
  return index % 8 === 0 ? SIZES[1 + (Math.floor(index / 8) % 3)] : SIZES[0];
}
/** Nominal box size for the %-based collision math — the name-cloud box
 * now fills the card's remaining height (`flex-1`, ~444px after the card's
 * height was corrected to match `B.7_Spotlight`'s 548px frame), not the old
 * fixed `h-80` (320px). A mismatch with the real rendered width/height only
 * makes the safety margin more/less generous; it never reintroduces the
 * identical-slot bug this replaces. */
const BOX_WIDTH_PX = 860;
const BOX_HEIGHT_PX = 444;
const CHAR_WIDTH_FACTOR = 0.58;
const COLLISION_GAP_PX = 6;
const MAX_RADIUS_STEPS = 60;
const RADIUS_STEP = 0.04;
/** Clamp bounds shared by `layoutNames` and `findFreeSlot`. Ground truth
 * (`B.7_Spotlight`, screen MaZUn5xHXZ) scatters name-TEXT nodes from ~9% to
 * ~108% (clipped) of the frame's own height — a near-full-height "wallpaper"
 * texture that deliberately overlaps `SpotlightTicker`'s band (~75%-96%):
 * the ticker's bold, opaque 14px text stays legible over the faint 6-11px
 * name texture, so the overlap is intended, not a rendering bug to avoid.
 * `TOP_MIN`/`TOP_MAX` reproduce that near-full-height range (small margins
 * so nothing clips the box's own top/bottom edge); `LEFT_MIN`/`LEFT_MAX`
 * span nearly the full width as before. */
const TOP_MIN = 3;
const TOP_MAX = 95;
const TOP_MID = (TOP_MIN + TOP_MAX) / 2;
const TOP_RANGE = (TOP_MAX - TOP_MIN) / 2;
const LEFT_MIN = 4;
const LEFT_MAX = 84;
/** %-grid resolution for `findFreeSlot`'s fallback scan — fine enough to
 * find a free cell between tightly-packed names without being slow for a
 * ~24-name list. */
const GRID_STEP_PCT = 1;

interface PlacedName {
  left: number;
  top: number;
  halfWidthPct: number;
  halfHeightPct: number;
}

function nameFootprintPct(name: string, size: string) {
  const metrics = SIZE_METRICS[size];
  const widthPx = name.length * metrics.fontPx * CHAR_WIDTH_FACTOR;
  return {
    halfWidthPct: ((widthPx + COLLISION_GAP_PX) / BOX_WIDTH_PX / 2) * 100,
    halfHeightPct: ((metrics.lineHeightPx + COLLISION_GAP_PX) / BOX_HEIGHT_PX / 2) * 100,
  };
}

function overlaps(a: PlacedName, b: PlacedName) {
  return (
    Math.abs(a.left - b.left) < a.halfWidthPct + b.halfWidthPct &&
    Math.abs(a.top - b.top) < a.halfHeightPct + b.halfHeightPct
  );
}

/** Deterministic scan of the whole placeable box for the least-overlapping
 * cell closest to `seed` — the escape hatch for a candidate whose radius
 * growth has saturated against the clamp bounds. Prefers a genuinely free
 * cell (zero overlap); when the box is packed tight enough that no cell at
 * `GRID_STEP_PCT` resolution is fully free, degrades gracefully to the cell
 * overlapping the FEWEST already-placed names, closest to `seed` as a
 * tiebreaker — every candidate this returns has been overlap-checked, so
 * two names never land on visibly colliding boxes when a clear cell
 * exists anywhere in the box. */
function findFreeSlot(
  seed: { top: number; left: number },
  footprint: { halfWidthPct: number; halfHeightPct: number },
  placed: PlacedName[],
): { top: number; left: number } {
  let best = { top: TOP_MIN, left: LEFT_MIN };
  let bestOverlapCount = Infinity;
  let bestDistance = Infinity;

  for (let top = TOP_MIN; top <= TOP_MAX; top += GRID_STEP_PCT) {
    for (let left = LEFT_MIN; left <= LEFT_MAX; left += GRID_STEP_PCT) {
      const candidate: PlacedName = { top, left, ...footprint };
      const overlapCount = placed.reduce(
        (count, other) => count + (overlaps(candidate, other) ? 1 : 0),
        0,
      );
      const distance = (top - seed.top) ** 2 + (left - seed.left) ** 2;

      if (overlapCount < bestOverlapCount || (overlapCount === bestOverlapCount && distance < bestDistance)) {
        best = { top, left };
        bestOverlapCount = overlapCount;
        bestDistance = distance;
      }
    }
  }

  return best;
}

/** Deterministic (top%, left%, size) per name — a Fibonacci/sunflower spiral
 * whose radius grows outward (same angle) until each name's estimated
 * footprint clears every previously-placed name, then clamps to stay
 * inside the box. Once radius growth saturates against the clamp (a no-op
 * retry, since `Math.min`/`Math.max` freeze the candidate at the same
 * corner), falls back to `findFreeSlot`'s deterministic, overlap-checked
 * box scan so no two names ever land on colliding boxes when a clear cell
 * exists. Pure function of `names` — same input always produces the same
 * layout. */
export function layoutNames(names: string[]) {
  const placed: PlacedName[] = [];

  return names.map((name, index) => {
    const size = pickSize(index);
    const { halfWidthPct, halfHeightPct } = nameFootprintPct(name, size);
    const angleRad = ((index * GOLDEN_ANGLE_DEG) % 360) * (Math.PI / 180);
    let radiusFraction = Math.sqrt((index + 0.5) / Math.max(names.length, 1));
    let top = 0;
    let left = 0;
    let clear = false;

    for (let step = 0; step < MAX_RADIUS_STEPS; step++) {
      top = Math.min(TOP_MAX, Math.max(TOP_MIN, TOP_MID + radiusFraction * TOP_RANGE * Math.sin(angleRad)));
      left = Math.min(LEFT_MAX, Math.max(LEFT_MIN, 50 + radiusFraction * 42 * Math.cos(angleRad)));
      const candidate: PlacedName = { left, top, halfWidthPct, halfHeightPct };
      if (!placed.some((other) => overlaps(candidate, other))) {
        clear = true;
        break;
      }
      radiusFraction += RADIUS_STEP;
    }

    if (!clear) {
      // Radius growth saturated against the clamp bounds — hand off to
      // findFreeSlot's exhaustive, overlap-checked grid scan. It always
      // returns a real position (a genuinely clear one when the box has
      // room, otherwise the least-overlapping cell available) instead of
      // the unchecked index-derived nudge this replaces, which could place
      // a name on top of another without ever re-testing for overlap.
      const free = findFreeSlot({ top, left }, { halfWidthPct, halfHeightPct }, placed);
      top = free.top;
      left = free.left;
    }

    placed.push({ left, top, halfWidthPct, halfHeightPct });
    return { top: `${top.toFixed(1)}%`, left: `${left.toFixed(1)}%`, size };
  });
}
