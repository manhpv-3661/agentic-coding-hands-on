import { Montserrat } from "next/font/google";

import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
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

interface AwardEntry extends Omit<AwardCardProps, "detailsHref"> {
  /** MoMorph instance node id — used for the React key and traceability. */
  nodeId: string;
}

/**
 * Mock award data extracted verbatim from the Figma design (MoMorph node
 * `5005:14974`, "mms_C2_Award list"). All 6 cards intentionally share the
 * same `Award-BG.png` placeholder photo — the design itself reuses one
 * image, this is not a data error. Descriptions for "Best Manager",
 * "Signature 2025 - Creator" and "MVP" are also identical in the source
 * design (unfinished copy) and are reproduced as-is per "do not invent
 * data". Replace with real award/CMS data once the backend track lands.
 *
 * Order MUST match `AWARD_CATEGORIES` (lib/awards/award-categories.ts) —
 * `detailsHref` is derived from that array by index below (FR-20/FR-21), not
 * stored here, so the two lists stay a single source of truth.
 */
const AWARDS: AwardEntry[] = [
  {
    nodeId: "2167:9075",
    // mm:I2167:9075;214:1019;81:2442
    thumbnailSrc: "/homepage-saa/Award-BG.png",
    // mm:I2167:9075;214:1019;214:666;10:951
    titleImageSrc: "/homepage-saa/Award-Name-TopTalent.png",
    titleAlt: "Top Talent",
    description: "Vinh danh top cá nhân xuất sắc trên mọi phương diện",
  },
  {
    nodeId: "2167:9076",
    // mm:I2167:9076;214:1019;81:2442
    thumbnailSrc: "/homepage-saa/Award-BG.png",
    // mm:I2167:9076;214:1019;214:666;214:654
    titleImageSrc: "/homepage-saa/Award-Name-TopProject.png",
    titleAlt: "Top Project",
    description:
      "Vinh danh dự án xuất sắc trên mọi phương diện, dự án có doanh thu nổi bật",
  },
  {
    nodeId: "2167:9077",
    // mm:I2167:9077;214:1019;81:2442
    thumbnailSrc: "/homepage-saa/Award-BG.png",
    // mm:I2167:9077;214:1019;214:666;214:655
    titleImageSrc: "/homepage-saa/Award-Name-TopProjectLeader.png",
    titleAlt: "Top Project Leader",
    description: "Vinh danh người quản lý truyền cảm hứng và dẫn dắt dự án bứt phá, ",
  },
  {
    nodeId: "2167:9079",
    // mm:I2167:9079;214:1019;81:2442
    thumbnailSrc: "/homepage-saa/Award-BG.png",
    // mm:I2167:9079;214:1019;214:666;214:656
    titleImageSrc: "/homepage-saa/Award-Name-BestManager.png",
    titleAlt: "Best Manager",
    description: "Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm",
  },
  {
    nodeId: "2167:9080",
    // mm:I2167:9080;214:1019;81:2442
    thumbnailSrc: "/homepage-saa/Award-BG.png",
    // mm:I2167:9080;214:1019;214:666;214:657
    titleImageSrc: "/homepage-saa/Award-Name-Signature2025Creator.png",
    titleAlt: "Signature 2025 - Creator",
    description: "Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm",
  },
  {
    nodeId: "2167:9081",
    // mm:I2167:9081;214:1019;81:2442
    thumbnailSrc: "/homepage-saa/Award-BG.png",
    // mm:I2167:9081;214:1019;214:666;214:653
    titleImageSrc: "/homepage-saa/Award-Name-MVP.png",
    titleAlt: "MVP (Most Valuable Person)",
    description: "Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm",
  },
];

/**
 * "Hệ thống giải thưởng" section of the Homepage SAA screen.
 * MoMorph node: `2167:9068`. Anchor target for the header nav's
 * "Awards Information" link (`id="awards-section"`).
 * Desktop reproduces the exact Figma column/row gap (108px / 80px, from
 * `2167:9074`/`2167:9078` child positions); tablet/mobile collapse to a
 * 2-column grid with a tighter gap since the design has no tablet frame.
 */
export function AwardsSection() {
  return (
    // mm:2167:9068
    // Matches the responsive container pattern used by hero-section.tsx /
    // sun-kudos-section.tsx: outer full-width section supplies the edge
    // gutter (144px at desktop, matching the "Bìa" parent frame's own
    // padding in Figma), inner column is capped at the design's 1224px
    // content width and centered — this section has no background art of
    // its own, so (unlike hero-section.tsx) there is nothing that needs to
    // bleed edge-to-edge.
    <section
      id="awards-section"
      className={`${montserrat.variable} flex w-full justify-center px-6 sm:px-10 lg:px-36`}
    >
      <div className="flex w-full max-w-[1224px] flex-col items-start gap-20">
        {/* mm:2167:9069 */}
        <div className="flex w-full flex-col items-start gap-4">
          {/* mm:2167:9070 */}
          <p className="font-montserrat text-[24px] leading-[32px] font-bold text-white">
            Sun* annual awards 2025
          </p>
          {/* mm:2167:9071 */}
          <div className="h-px w-full bg-[#2E3940]" />
          {/* mm:2167:9072 */}
          <div className="flex w-full flex-row items-center gap-8">
            {/* mm:2167:9073 */}
            <h2 className="font-montserrat text-[57px] leading-[64px] font-bold tracking-[-0.25px] text-[#FFEA9E]">
              Hệ thống giải thưởng
            </h2>
          </div>
        </div>
        {/* mm:5005:14974 */}
        <div className="grid w-full grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3 lg:gap-x-[108px] lg:gap-y-20">
          {AWARDS.map(({ nodeId, ...card }, index) => (
            <AwardCard
              key={nodeId}
              {...card}
              detailsHref={`/awards#${AWARD_CATEGORIES[index]?.slug ?? ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
