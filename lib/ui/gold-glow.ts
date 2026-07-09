/**
 * Shared "gold glow" shadow literals — hand-copied across `home/` and
 * `awards/` components (nav-link, site-footer, widget-button, award-card,
 * awards-nav-menu, award-detail-card). Copied verbatim from
 * `app/components/home/widget-button.tsx` (boxShadow) and
 * `app/components/home/nav-link.tsx` (textShadow) — do not "clean up"
 * these values, see
 * plans/260709-1710-ui-refactor-cleanup/phase-00-shared-primitives-foundation.md.
 */
export const GOLD_GLOW_BOX_SHADOW =
  "0 4px 4px 0 rgba(0, 0, 0, 0.25), 0 0 6px 0 #FAE287";

export const GOLD_GLOW_TEXT_SHADOW =
  "0 4px 4px rgba(0, 0, 0, 0.25), 0 0 6px #FAE287";
