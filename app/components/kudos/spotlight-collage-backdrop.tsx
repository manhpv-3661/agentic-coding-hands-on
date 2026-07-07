/**
 * Decorative Spotlight backdrop (mm:`B.7_Spotlight` 2940:14174 background
 * stack: `image 24`, `image 25`, `Root further mo rong 1`).
 *
 * CONFIRMED DEFECT (fixed here): this previously rendered
 * `public/kudos/spotlight-crop.png`, a flattened screenshot of the whole
 * board with ~120 interactive names baked into the pixels, layered UNDER
 * the real DOM name-cloud (`spotlight-name-cloud.tsx`). That doubled every
 * name (once as illegible baked pixels, once as real DOM/interactive text)
 * and violated the asset rule — background layers must be decorative-only;
 * text/interactive content must be DOM
 * (`.claude/rules/momorph/momorph-layout-system.md`).
 *
 * INTERIM FIX: the design's clean decorative-only exports (`image 24`/
 * `image 25`/`Root further mo rong 1`) cannot be re-exported right now —
 * `get_figma_image`/`get_media_file` return 500/401 (credential gap, not a
 * code issue; re-checked and still failing as of this fix). Per phase-07's
 * strategy (b), this backdrop is reconstructed from CSS-only layers instead
 * of any bitmap: a radial wash in the section's own flat navy
 * (`rgba(0,16,26,1)`, mm:`MaZUn5xHXZ`) for depth, the same accent color
 * blobs the previous crop-based version used (kept — they read close to the
 * design's warm/green/red accent hues), and a faint repeating diagonal
 * line texture standing in for the photo's wave/network pattern. No baked
 * text, so the DOM name-cloud is the single source of truth for names.
 *
 * FOLLOW-UP (tracked in plan.md open questions): once MoMorph Figma image
 * export auth is restored, swap this for the real `image 24`/`image 25`/
 * `Root further mo rong 1` decorative exports and delete this
 * reconstruction.
 */
export function SpotlightCollageBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden rounded-[47px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(30,58,74,0.55),rgba(0,16,26,1)_60%)]" />
      <div className="absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(115deg,rgba(255,234,158,0.6)_0px,rgba(255,234,158,0.6)_1px,transparent_1px,transparent_64px)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_88%,rgba(228,117,33,0.18),transparent_21%),radial-gradient(circle_at_7%_22%,rgba(102,177,88,0.14),transparent_17%),radial-gradient(circle_at_34%_90%,rgba(166,64,38,0.16),transparent_19%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.34)_100%)]" />
    </div>
  );
}
