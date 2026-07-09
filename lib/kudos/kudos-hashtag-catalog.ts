/**
 * ⚠️ INVENTED PLACEHOLDER CONTENT — not design-sourced.
 *
 * Phase 04 (`plans/260709-1530-kudos-i18n-spotlight-filter-hashtag/
 * phase-04-hashtag-catalog-upgrade.md`) adds a predefined-hashtag dropdown
 * and a "hashtag group" preset selector to `HashtagInput`. The live MoMorph
 * design (fileKey `9ypp4enmFmdK3YAFJLIu6C`, screens `JsTvi8KVQA` /
 * `RO7O6QOhfJ`, `Frame 536` → `Tag Group` node `662:8595`) does NOT contain
 * this feature at all — no catalog, no checkmark selection, no group
 * concept. It only has 4 sample chips, a "+Hashtag" trigger, free-text add,
 * per-chip remove, and a max-5 cap (all already implemented before this
 * phase).
 *
 * Building the catalog/group UI anyway is an explicit, user-authorized
 * override of the MoMorph "never invent design content" rule (decision
 * recorded 2026-07-09, see the phase file's "Decisions" section). Because
 * there is no real spec to source from, every value below — the catalog
 * strings and the group groupings — is invented placeholder content. It is
 * isolated in this one file specifically so it is trivial to swap for a
 * real product-owned catalog when one exists; nothing else in the app
 * depends on these exact values (the server keeps its own max-5-only
 * validation and does not treat this list as an allow-list).
 *
 * The first 4 catalog entries mirror the design's own 4 sample chips
 * verbatim, with chip 4's design typo ("High-perorming") corrected to
 * `#HIGH-PERFORMING`. The remaining entries are additional Sun*-culture-
 * style tags invented for this phase.
 */

/** Static list of suggested hashtags shown in the catalog dropdown. */
export const KUDOS_HASHTAG_CATALOG: string[] = [
  "#BE OPTIMISTIC",
  "#WASSHOI",
  "#BE A TEAM",
  "#HIGH-PERFORMING",
  "#OWNERSHIP",
  "#CUSTOMER FIRST",
  "#INNOVATION",
  "#GRATITUDE",
  "#TEAMWORK",
  "#LEADERSHIP",
];

/**
 * Group `id`s double as i18n keys under `compose.hashtags.groups.*` in both
 * dictionaries — the group's display name is resolved from there, never
 * hardcoded, so only the grouping/tag membership lives in this file.
 */
export type KudosHashtagGroupId = "cultureValues" | "performance" | "teamwork";

export interface KudosHashtagGroup {
  id: KudosHashtagGroupId;
  /** Catalog entries this preset bulk-adds, in application order. */
  tags: string[];
}

export const KUDOS_HASHTAG_GROUPS: KudosHashtagGroup[] = [
  { id: "cultureValues", tags: ["#BE OPTIMISTIC", "#WASSHOI", "#BE A TEAM"] },
  { id: "performance", tags: ["#HIGH-PERFORMING", "#OWNERSHIP", "#INNOVATION"] },
  { id: "teamwork", tags: ["#TEAMWORK", "#LEADERSHIP", "#GRATITUDE"] },
];
