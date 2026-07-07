import { Montserrat } from "next/font/google";

import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { ContentFrame, PageGutter } from "../layout/page-layout";
import { AwardCard, type AwardCardProps } from "./award-card";

/**
 * Fonts required by the Figma design for this section only. Scoped here
 * (not the root layout) so the section stays self-contained regardless of
 * which page eventually composes it — mirrors `app/login/fonts.ts`.
 */
const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

/** Keys of `homepage.awards.items` — one per award slug in the dictionary. */
type AwardSlug = keyof Dictionary["homepage"]["awards"]["items"];

interface AwardEntry extends Omit<AwardCardProps, "detailsHref" | "description" | "detailsCta"> {
  /** MoMorph instance node id — used for the React key and traceability. */
  nodeId: string;
  /** Key into `homepage.awards.items.<slug>.description` (F005) — the
   * description string itself now lives in the dictionary, not here. */
  slug: AwardSlug;
}

/**
 * Award data extracted from the Figma design (MoMorph node `5005:14974`,
 * "mms_C2_Award list"). Each card's thumbnail is a distinct per-award image
 * (background + gold-ring + name pre-composited), cropped from the MoMorph
 * full-frame render — the awards detail page (`award-detail-data.ts`) uses
 * the same 6 assets. Descriptions for "Best Manager", "Signature 2025 -
 * Creator" and "MVP" are identical in the source design (unfinished copy) —
 * the dictionary mirrors that duplication (`homepage.awards.items.*`),
 * reproduced as-is per "do not invent data". Replace with real award/CMS
 * data once the backend track lands.
 *
 * Order MUST match `AWARD_CATEGORIES` (lib/awards/award-categories.ts) —
 * `detailsHref` is derived from that array by index below (FR-20/FR-21), not
 * stored here, so the two lists stay a single source of truth.
 */
const AWARDS: AwardEntry[] = [
  {
    nodeId: "2167:9075",
    // mm:I2167:9075;214:1019;81:2442
    thumbnailSrc: "/awards-saa/thumbnails/top-talent.png",
    titleAlt: "Top Talent",
    slug: "topTalent",
  },
  {
    nodeId: "2167:9076",
    // mm:I2167:9076;214:1019;81:2442
    thumbnailSrc: "/awards-saa/thumbnails/top-project.png",
    titleAlt: "Top Project",
    slug: "topProject",
  },
  {
    nodeId: "2167:9077",
    // mm:I2167:9077;214:1019;81:2442
    thumbnailSrc: "/awards-saa/thumbnails/top-project-leader.png",
    titleAlt: "Top Project Leader",
    slug: "topProjectLeader",
  },
  {
    nodeId: "2167:9079",
    // mm:I2167:9079;214:1019;81:2442
    thumbnailSrc: "/awards-saa/thumbnails/best-manager.png",
    titleAlt: "Best Manager",
    slug: "bestManager",
  },
  {
    nodeId: "2167:9080",
    // mm:I2167:9080;214:1019;81:2442
    thumbnailSrc: "/awards-saa/thumbnails/signature-2025-creator.png",
    titleAlt: "Signature 2025 - Creator",
    slug: "signatureCreator",
  },
  {
    nodeId: "2167:9081",
    // mm:I2167:9081;214:1019;81:2442
    thumbnailSrc: "/awards-saa/thumbnails/mvp.png",
    titleAlt: "MVP (Most Valuable Person)",
    slug: "mvp",
  },
];

export interface AwardsSectionProps {
  /** Section heading + per-award descriptions (`homepage.awards`). */
  awards: Dictionary["homepage"]["awards"];
  /** "Chi tiết" / "Details" CTA label, forwarded to every `<AwardCard>`
   * (`shared.detailsCta`). */
  detailsCta: Dictionary["shared"]["detailsCta"];
}

/**
 * "Hệ thống giải thưởng" section of the Homepage SAA screen.
 * MoMorph node: `2167:9068`. Anchor target for the header nav's
 * "Awards Information" link (`id="awards-section"`).
 * Desktop reproduces the exact Figma column/row gap (108px / 80px, from
 * `2167:9074`/`2167:9078` child positions); tablet/mobile collapse to a
 * 2-column grid with a tighter gap since the design has no tablet frame.
 */
export function AwardsSection({ awards, detailsCta }: AwardsSectionProps) {
  return (
    // mm:2167:9068
    // Matches the responsive container pattern used by hero-section.tsx /
    // sun-kudos-section.tsx: outer full-width section supplies the edge
    // gutter (144px at desktop, matching the "Bìa" parent frame's own
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
        <div className="grid w-full grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3 lg:gap-x-[108px] lg:gap-y-20">
          {AWARDS.map(({ nodeId, slug, ...card }, index) => (
            <AwardCard
              key={nodeId}
              description={awards.items[slug].description}
              detailsCta={detailsCta}
              {...card}
              detailsHref={`/awards#${AWARD_CATEGORIES[index]?.slug ?? ""}`}
            />
          ))}
        </div>
      </ContentFrame>
    </PageGutter>
  );
}
