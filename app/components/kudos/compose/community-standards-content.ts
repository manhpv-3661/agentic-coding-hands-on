/**
 * Static structural data for the Community Standards panel (F007, FR-23,
 * revises FR-10; MoMorph `b1Filzi9i6`, "Thể lệ UPDATE"). Translated copy
 * lives entirely in the i18n dictionary (`kudos.compose.communityStandards`,
 * Phase 1) — this module only holds the non-translatable ids/colors and one
 * pure parsing helper, so `community-standards-panel.tsx` can stay under the
 * 200-line cap by just zipping these with the dict arrays at render (BR-2:
 * static content only, no Hero-badge computation).
 */

/** Hero-tier ids, in display order — index-aligned with the dictionary's
 * `heroTiers` array (New/Rising/Super/Legend Hero). Used only as React
 * `key`s; the badge pill itself reuses the exact style already shipped for
 * `KudosPersonBlock` (F008, MoMorph component set `3007:17505`) for pixel
 * parity — no new badge component. */
export const HERO_TIER_IDS = ["new-hero", "rising-hero", "super-hero", "legend-hero"] as const;

export interface CollectionIconMeta {
  id: string;
  /** Rendered inside the swatch circle. */
  initials: string;
  /** Swatch fill — reuses `avatar.tsx`'s existing palette hexes so the new
   * swatches read as the same design language as every other
   * initials-in-a-colored-circle placeholder in this app. */
  color: string;
}

/** Collection-icon ids + swatch metadata, in display order — index-aligned
 * with the dictionary's `collectionIcons` array (Revival, Touch of Light,
 * Stay Gold, Flow to Horizon, Beyond the Boundary, Root Further). No
 * exportable illustration assets exist for these 6 badges (Figma nodes are
 * component *instances*, not exported images — the same situation
 * `avatar.tsx` already solved for people avatars), so each renders as an
 * initials-in-colored-circle swatch instead of a fetched image.
 */
export const COLLECTION_ICONS: CollectionIconMeta[] = [
  { id: "revival", initials: "RV", color: "#8FD3FF" },
  { id: "touch-of-light", initials: "TL", color: "#FFD08A" },
  { id: "stay-gold", initials: "SG", color: "#FFEA9E" },
  { id: "flow-to-horizon", initials: "FH", color: "#FFB0B0" },
  { id: "beyond-the-boundary", initials: "BB", color: "#B6F2C0" },
  { id: "root-further", initials: "RF", color: "#D7B8FF" },
];

/**
 * Splits a "heading\nbody" dictionary string into its two parts. The P1
 * dictionary bundles the gold section heading and its white description
 * paragraph into one string (`recipientHeading`/`senderHeading`) — this
 * mirrors the ground truth's two separate Figma text nodes at render time
 * without re-shaping the dictionary (out of this phase's file ownership).
 * Falls back to an empty body when no newline is present (matches
 * `nationalHeading`, which the dictionary keeps heading-only).
 */
export function splitHeadingAndBody(text: string): { heading: string; body: string } {
  const newlineIndex = text.indexOf("\n");
  if (newlineIndex === -1) return { heading: text, body: "" };
  return { heading: text.slice(0, newlineIndex), body: text.slice(newlineIndex + 1) };
}
