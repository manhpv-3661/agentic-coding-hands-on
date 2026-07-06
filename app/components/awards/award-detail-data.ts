import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import type { AwardDetailCardProps } from "./award-detail-card";

export type AwardDetailEntry = AwardDetailCardProps;

/**
 * Verbatim description shared by Top Talent, Top Project, Top Project
 * Leader, Best Manager and MVP — the Figma source design has not yet
 * finished writing per-category copy for these 5 categories, so they all
 * carry the exact same paragraph (mirrors the precedent already documented
 * on the homepage grid, `award-card.tsx`: "descriptions ... identical in
 * the source design ... reproduced as-is"). Source: `spec/awards-page/
 * feature.md` §2.5 (FR-12). Do not shorten, paraphrase, or invent copy.
 */
const SHARED_UNFINISHED_DESCRIPTION =
  "Giải thưởng Top Talent vinh danh những cá nhân xuất sắc toàn diện – những người không ngừng khẳng định năng lực chuyên môn vững vàng, hiệu suất công việc vượt trội, luôn mang lại giá trị vượt kỳ vọng, được đánh giá cao bởi khách hàng và đồng đội. Với tinh thần sẵn sàng nhận mọi nhiệm vụ tổ chức giao phó, họ luôn là nguồn cảm hứng, thúc đẩy động lực và tạo ảnh hưởng tích cực đến cả tập thể.";

/**
 * Signature 2025 - Creator is the only category with its own distinct
 * verbatim copy in the source design. Source: `spec/awards-page/
 * feature.md` §2.5 (FR-12).
 */
const SIGNATURE_2025_CREATOR_DESCRIPTION =
  'Giải thưởng Signature vinh danh cá nhân hoặc tập thể thể hiện tinh thần đặc trưng mà Sun* hướng tới trong từng thời kỳ. Trong năm 2025, giải thưởng Signature vinh danh Creator - cá nhân/tập thể mang tư duy chủ động và nhạy bén, luôn nhìn thấy cơ hội trong thách thức và tiên phong trong hành động. Họ là những người nhạy bén với vấn đề, nhanh chóng nhận diện và đưa ra những giải pháp thực tiễn, mang lại giá trị rõ rệt cho dự án, khách hàng hoặc tổ chức. Với tư duy kiến tạo và tinh thần "Creator" đặc trưng của Sun*, họ không chỉ phản ứng tích cực trước sự thay đổi mà còn chủ động tạo ra cải tiến, góp phần định hình chuẩn mực mới cho cách mà người Sun* tạo giá trị.';

/**
 * The 6 award detail entries for the `/awards` catalog (Phase 05 wraps each
 * one in `<section id={slug}>`). Order and slugs MUST match
 * `AWARD_CATEGORIES` (`lib/awards/award-categories.ts`) — asserted by
 * `award-detail-card.test.tsx`. Title/quantity/value are the FR-12 table
 * values from `spec/awards-page/feature.md` §2.5 — note the MVP title
 * includes its long form ("MVP (Most Valuable Person)"), matching the
 * FR-12 table and the homepage precedent (`awards-section.tsx`'s
 * `titleAlt`), even though `AWARD_CATEGORIES` stores the short "MVP".
 */
export const AWARD_DETAIL_ENTRIES: AwardDetailEntry[] = [
  {
    slug: AWARD_CATEGORIES[0].slug,
    title: "Top Talent",
    description: SHARED_UNFINISHED_DESCRIPTION,
    quantity: "10 Đơn vị",
    value: "7.000.000 VNĐ cho mỗi giải thưởng",
    titleImageSrc: "/homepage-saa/Award-Name-TopTalent.png",
  },
  {
    slug: AWARD_CATEGORIES[1].slug,
    title: "Top Project",
    description: SHARED_UNFINISHED_DESCRIPTION,
    quantity: "02 Tập thể",
    value: "15.000.000 VNĐ mỗi giải",
    titleImageSrc: "/homepage-saa/Award-Name-TopProject.png",
  },
  {
    slug: AWARD_CATEGORIES[2].slug,
    title: "Top Project Leader",
    description: SHARED_UNFINISHED_DESCRIPTION,
    quantity: "03 Cá nhân",
    value: "7.000.000 VNĐ",
    titleImageSrc: "/homepage-saa/Award-Name-TopProjectLeader.png",
  },
  {
    slug: AWARD_CATEGORIES[3].slug,
    title: "Best Manager",
    description: SHARED_UNFINISHED_DESCRIPTION,
    quantity: "01 Cá nhân",
    value: "10.000.000 VNĐ",
    titleImageSrc: "/homepage-saa/Award-Name-BestManager.png",
  },
  {
    slug: AWARD_CATEGORIES[4].slug,
    title: "Signature 2025 - Creator",
    description: SIGNATURE_2025_CREATOR_DESCRIPTION,
    quantity: "01 (cá nhân hoặc tập thể)",
    value: "5.000.000 VNĐ (cá nhân) HOẶC 8.000.000 VNĐ (tập thể)",
    titleImageSrc: "/homepage-saa/Award-Name-Signature2025Creator.png",
  },
  {
    slug: AWARD_CATEGORIES[5].slug,
    title: "MVP (Most Valuable Person)",
    description: SHARED_UNFINISHED_DESCRIPTION,
    quantity: "01",
    value: "15.000.000 VNĐ",
    titleImageSrc: "/homepage-saa/Award-Name-MVP.png",
  },
];
