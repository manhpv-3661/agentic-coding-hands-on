import { montserrat } from "@/app/fonts";
import type { AwardCategoryRow } from "@/lib/awards/award-categories-repository";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { ContentFrame, PageGutter } from "../layout/page-layout";
import { AwardCard, type AwardCardProps } from "./award-card";

/** Keys of `homepage.awards.items` — one per award slug in the dictionary. */
type AwardSlug = keyof Dictionary["homepage"]["awards"]["items"];

/**
 * Per-slug static metadata that never comes from the DB and never changes
 * with locale: the hardcoded English title (brand/category name, not
 * translated — locked decision, mirrors `award-detail-data.ts`'s
 * `CATEGORY_META`) and which `homepage.awards.items.<key>` dictionary entry
 * supplies this card's description. Kept as its own copy here (not imported
 * from `award-detail-data.ts`) because that map is private to the
 * `/awards`-detail feature (phase-02, `app/components/awards/*` is out of
 * this phase's ownership) and keys into a different dict slice
 * (`awards.detail.entries`, not `homepage.awards.items`).
 *
 * Keyed by slug (not DB row order) so a slug present in `award_categories`
 * but missing here is detected explicitly — skipped with a `console.warn`
 * rather than silently misaligned, same guard as `buildAwardDetailEntries`.
 *
 * Original MoMorph instance node ids (node `5005:14974`, kept here only for
 * traceability — no longer threaded per-row since the grid order now comes
 * from the DB's `sort_order`, not a fixed array): top-talent = `2167:9075`,
 * top-project = `2167:9076`, top-project-leader = `2167:9077`,
 * best-manager = `2167:9079`, signature-2025-creator = `2167:9080`,
 * mvp = `2167:9081`.
 */
const AWARD_CARD_META: Readonly<Record<string, { title: string; itemKey: AwardSlug }>> = {
  "top-talent": { title: "Top Talent", itemKey: "topTalent" },
  "top-project": { title: "Top Project", itemKey: "topProject" },
  "top-project-leader": { title: "Top Project Leader", itemKey: "topProjectLeader" },
  "best-manager": { title: "Best Manager", itemKey: "bestManager" },
  "signature-2025-creator": { title: "Signature 2025 - Creator", itemKey: "signatureCreator" },
  mvp: { title: "MVP (Most Valuable Person)", itemKey: "mvp" },
};

type AwardCardEntry = Omit<AwardCardProps, "detailsCta"> & { nodeId: string };

/**
 * Builds this grid's card props by merging `award_categories` rows (slug,
 * order, thumbnail — `getAwardCategories()`, phase-02) with
 * `homepage.awards.items` (localized description) and the local
 * `AWARD_CARD_META` (title, dict key) by `slug` — the same slug-merge shape
 * `award-detail-data.ts`'s `buildAwardDetailEntries` uses for the `/awards`
 * page, scoped to this file since the homepage grid needs a different dict
 * slice and title set (no quantity/value unit captions here).
 */
function buildAwardCards(
  categories: AwardCategoryRow[],
  items: Dictionary["homepage"]["awards"]["items"],
): AwardCardEntry[] {
  const cards: AwardCardEntry[] = [];

  for (const row of categories) {
    const meta = AWARD_CARD_META[row.slug];

    if (!meta) {
      console.warn(
        `[awards-section] no title metadata for award slug "${row.slug}", skipping card`,
      );
      continue;
    }

    cards.push({
      nodeId: row.slug,
      thumbnailSrc: row.thumbnailSrc,
      titleAlt: meta.title,
      description: items[meta.itemKey].description,
      detailsHref: `/awards#${row.slug}`,
    });
  }

  return cards;
}

export interface AwardsSectionProps {
  /** Section heading + per-award descriptions (`homepage.awards`). */
  awards: Dictionary["homepage"]["awards"];
  /** "Chi tiết" / "Details" CTA label, forwarded to every `<AwardCard>`
   * (`shared.detailsCta`). */
  detailsCta: Dictionary["shared"]["detailsCta"];
  /** Structural/numeric award rows (`getAwardCategories()`, phase-02) —
   * replaces the formerly-inline `AWARDS` array so this grid and the
   * `/awards` detail page share exactly one source of category data
   * (order, thumbnail, slug); no more title/thumbnail drift between them. */
  categories: AwardCategoryRow[];
}

/**
 * "Hệ thống giải thưởng" section of the Homepage SAA screen.
 * MoMorph node: `2167:9068`. Anchor target for the header nav's
 * "Awards Information" link (`id="awards-section"`).
 * Desktop-only (native 1512 frame): reproduces the exact Figma column/row
 * gap (108px / 80px, from `2167:9074`/`2167:9078` child positions) with no
 * responsive tiers.
 */
export function AwardsSection({ awards, detailsCta, categories }: AwardsSectionProps) {
  const cards = buildAwardCards(categories, awards.items);

  return (
    // mm:2167:9068
    // Matches the container pattern used by hero-section.tsx /
    // sun-kudos-section.tsx: outer full-width section supplies the edge
    // gutter (144px, matching the "Bìa" parent frame's own
    // padding in Figma), inner column is capped at the design's 1224px
    // content width and centered — this section has no background art of
    // its own, so (unlike hero-section.tsx) there is nothing that needs to
    // bleed edge-to-edge.
    <PageGutter
      as="section"
      id="awards-section"
      className={`${montserrat.variable} flex justify-center`}
    >
      <ContentFrame width={1224} className="flex flex-col items-start gap-20">
        {/* mm:2167:9069 */}
        <div className="flex w-full flex-col items-start gap-4">
          {/* mm:2167:9070 — "Sun* annual awards 2025" is a brand name, stays
              untranslated (clarifications.md Q4), same as "Sun* Kudos". */}
          <p className="font-montserrat text-[24px] leading-[32px] font-bold text-white">
            Sun* annual awards 2025
          </p>
          {/* mm:2167:9071 */}
          <div className="h-px w-full bg-[#2E3940]" />
          {/* mm:2167:9072 */}
          <div className="flex w-full flex-row items-center gap-8">
            {/* mm:2167:9073 */}
            <h2 className="font-montserrat text-[57px] leading-[64px] font-bold tracking-[-0.25px] text-[#FFEA9E]">
              {awards.heading}
            </h2>
          </div>
        </div>
        {/* mm:5005:14974 */}
        <div className="grid w-full grid-cols-3 gap-x-27 gap-y-20">
          {cards.map(({ nodeId, ...card }) => (
            <AwardCard key={nodeId} detailsCta={detailsCta} {...card} />
          ))}
        </div>
      </ContentFrame>
    </PageGutter>
  );
}
