import type { GiftRecipient, KudosPost, KudosStats } from "./kudos-types";

/**
 * Single source of truth for the Sun* Kudos live board mock content
 * (F006). This module IS the stand-in "database" for this frontend-only
 * mock project (clarifications.md) — every section (Highlight carousel,
 * Spotlight board, All Kudos feed, filters, stats sidebar, top-10 gifts)
 * reads from here via the pure selectors in `kudos-selectors.ts`.
 *
 * Content is plausible mock Vietnamese SAA 2025 copy, not translated —
 * only UI *labels* go through `lib/i18n` (see `dictionary.kudos`).
 */
export const KUDOS_POSTS: KudosPost[] = [
  {
    id: "kudos-1",
    sender: { name: "Nguyễn Văn An", department: "Phòng Kỹ thuật", stars: 12 },
    recipient: { name: "Trần Thị Bình", department: "Phòng Thiết kế", stars: 18 },
    timestamp: "09:30 - 12/25/2025",
    content:
      "Cảm ơn bạn đã hỗ trợ team review lại toàn bộ luồng UI ngay trong đêm trước demo, nhờ vậy sản phẩm kịp bàn giao đúng hạn cho khách hàng.",
    hashtags: ["#teamwork", "#dedication"],
    imageCount: 3,
    hearts: 45,
  },
  {
    id: "kudos-2",
    sender: { name: "Lê Hoàng Nam", department: "Phòng Kinh doanh", stars: 9 },
    recipient: { name: "Phạm Thị Hương", department: "Phòng Kỹ thuật", stars: 21 },
    timestamp: "14:05 - 12/24/2025",
    content:
      "Giải pháp bạn đề xuất giúp giảm 30% thời gian xử lý batch job, cả team đều rất nể tinh thần chủ động tìm cách cải tiến của bạn.",
    hashtags: ["#innovation", "#leadership"],
    imageCount: 0,
    hearts: 60,
  },
  {
    id: "kudos-3",
    sender: { name: "Đỗ Minh Khôi", department: "Phòng Thiết kế", stars: 7 },
    recipient: { name: "Vũ Thị Lan", department: "Phòng Nhân sự", stars: 14 },
    timestamp: "10:15 - 12/23/2025",
    content:
      "Cảm ơn bạn đã tổ chức buổi onboarding rất chu đáo cho thành viên mới, ai cũng cảm thấy được chào đón ngay từ ngày đầu.",
    hashtags: ["#supportive"],
    imageCount: 1,
    hearts: 22,
  },
  {
    id: "kudos-4",
    sender: { name: "Hoàng Văn Đức", department: "Phòng QA", stars: 11 },
    recipient: { name: "Bùi Thị Mai", department: "Phòng Kỹ thuật", stars: 16 },
    timestamp: "16:40 - 12/22/2025",
    content:
      "Bạn phát hiện một lỗi nghiêm trọng trước khi release, giúp cả team tránh được một sự cố lớn với khách hàng. Cảm ơn sự tỉ mỉ của bạn!",
    hashtags: ["#dedication", "#teamwork"],
    imageCount: 5,
    hearts: 50,
  },
  {
    id: "kudos-5",
    sender: { name: "Đặng Văn Sơn", department: "Phòng Kỹ thuật", stars: 6 },
    recipient: { name: "Ngô Thị Yến", department: "Phòng Kinh doanh", stars: 10 },
    timestamp: "08:20 - 12/21/2025",
    content: "Cảm ơn bạn đã hỗ trợ chuẩn bị tài liệu pitch rất nhanh và chuyên nghiệp.",
    hashtags: ["#supportive", "#creativity"],
    imageCount: 0,
    hearts: 15,
  },
  {
    id: "kudos-6",
    sender: { name: "Trịnh Văn Hải", department: "Phòng Nhân sự", stars: 8 },
    recipient: { name: "Nguyễn Văn An", department: "Phòng Kỹ thuật", stars: 12 },
    timestamp: "11:50 - 12/20/2025",
    content:
      "Cảm ơn bạn đã dành thời gian mentor các bạn intern, sự kiên nhẫn và tận tâm của bạn là nguồn cảm hứng cho cả team.",
    hashtags: ["#leadership", "#dedication"],
    imageCount: 2,
    hearts: 33,
  },
  {
    id: "kudos-7",
    sender: { name: "Trần Thị Bình", department: "Phòng Thiết kế", stars: 18 },
    recipient: { name: "Lê Hoàng Nam", department: "Phòng Kinh doanh", stars: 9 },
    timestamp: "13:10 - 12/19/2025",
    content: "Ý tưởng thiết kế bao bì quà tặng SAA 2025 của bạn rất sáng tạo và ấn tượng!",
    hashtags: ["#creativity"],
    imageCount: 4,
    hearts: 8,
  },
  {
    id: "kudos-8",
    sender: { name: "Phạm Thị Hương", department: "Phòng Kỹ thuật", stars: 21 },
    recipient: { name: "Đỗ Minh Khôi", department: "Phòng Thiết kế", stars: 7 },
    timestamp: "09:05 - 12/18/2025",
    content: "Cảm ơn bạn đã luôn hỗ trợ team kỹ thuật khi cần feedback thiết kế gấp.",
    hashtags: ["#teamwork", "#supportive"],
    imageCount: 1,
    hearts: 27,
  },
  {
    id: "kudos-9",
    sender: { name: "Vũ Thị Lan", department: "Phòng Nhân sự", stars: 14 },
    recipient: { name: "Hoàng Văn Đức", department: "Phòng QA", stars: 11 },
    timestamp: "15:30 - 12/17/2025",
    content: "Cảm ơn bạn đã chủ động đề xuất quy trình test mới giúp giảm đáng kể lỗi hồi quy.",
    hashtags: ["#innovation", "#dedication"],
    imageCount: 0,
    hearts: 19,
  },
  {
    id: "kudos-10",
    sender: { name: "Bùi Thị Mai", department: "Phòng Kỹ thuật", stars: 16 },
    recipient: { name: "Trịnh Văn Hải", department: "Phòng Nhân sự", stars: 8 },
    timestamp: "17:00 - 12/16/2025",
    content: "Cảm ơn bạn đã tổ chức chương trình team building rất vui và gắn kết!",
    hashtags: ["#supportive", "#teamwork"],
    imageCount: 2,
    hearts: 5,
  },
  {
    id: "kudos-11",
    sender: { name: "Ngô Thị Yến", department: "Phòng Kinh doanh", stars: 10 },
    recipient: { name: "Đặng Văn Sơn", department: "Phòng Kỹ thuật", stars: 6 },
    timestamp: "12:25 - 12/15/2025",
    content:
      "Bạn đã hỗ trợ khắc phục sự cố hệ thống ngay giữa đêm để kịp demo cho khách hàng sáng hôm sau, cảm ơn sự trách nhiệm cao của bạn.",
    hashtags: ["#dedication", "#leadership"],
    imageCount: 3,
    hearts: 41,
  },
  {
    id: "kudos-12",
    sender: { name: "Đỗ Minh Khôi", department: "Phòng Thiết kế", stars: 7 },
    recipient: { name: "Ngô Thị Yến", department: "Phòng Kinh doanh", stars: 10 },
    timestamp: "10:45 - 12/14/2025",
    content: "Cảm ơn bạn đã hỗ trợ khách hàng rất chuyên nghiệp trong buổi demo cuối năm.",
    hashtags: ["#creativity", "#innovation"],
    imageCount: 0,
    hearts: 38,
  },
];

/**
 * Names scattered across the Spotlight word-cloud (FR-10). A modest list
 * (not 388 — that would defeat the point of a static mock), with overlap
 * against `KUDOS_POSTS` recipients so the substring search demo feels real.
 */
export const SPOTLIGHT_NAMES: string[] = [
  "Nguyễn Văn An",
  "Trần Thị Bình",
  "Phạm Thị Hương",
  "Vũ Thị Lan",
  "Bùi Thị Mai",
  "Ngô Thị Yến",
  "Hoàng Văn Đức",
  "Đỗ Minh Khôi",
  "Lê Hoàng Nam",
  "Đặng Văn Sơn",
  "Trịnh Văn Hải",
  "Huỳnh Dương Xuân",
  "Lý Thị Ngọc",
  "Phan Văn Quang",
  "Dương Thị Thảo",
  "Vương Minh Tuấn",
  "Đinh Thị Hạnh",
  "Tô Văn Phúc",
  "Chu Thị Linh",
  "Mai Văn Kiên",
  "Lâm Thị Diệp",
  "Cao Văn Thắng",
  "Kiều Thị Vân",
  "Đoàn Văn Long",
];

/** The "388 KUDOS" counter (FR-10) — a number, independent of the rendered
 * name-cloud item count. */
export const SPOTLIGHT_TOTAL = 388;

/** Static mock stats for the sidebar (FR-18) — no real points/reward
 * system exists in this mock project. */
export const KUDOS_STATS: KudosStats = {
  received: 24,
  sent: 18,
  hearts: 312,
  secretBoxOpened: 9,
  secretBoxUnopened: 5,
};

/**
 * "10 SUNNER NHẬN QUÀ MỚI NHẤT" (FR-20). The design frame's own visible
 * rows repeat one identical placeholder ("Huỳnh Dương Xuân" / "Nhận được 1
 * áo phông SAA") — per clarifications.md, extended to 10 rows by repeating
 * that exact literal rather than inventing distinct data the design does
 * not provide.
 */
export const RECENT_GIFT_RECIPIENTS: GiftRecipient[] = Array.from(
  { length: 10 },
  () => ({ name: "Huỳnh Dương Xuân", gift: "Nhận được 1 áo phông SAA" }),
);
