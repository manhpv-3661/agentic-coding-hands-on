# Clarifications — Homepage SAA (F002)

## Session 2026-07-06

- Q: Access control mâu thuẫn — commission yêu cầu `/` bảo vệ, TC ID-0 mô tả public homepage? → A: Bảo vệ `/` theo commission: chưa auth → redirect `/login`; sau đăng nhập redirect về `/` (thay đích `/todo`). TC ID-0 coi là outdated, E2E viết theo mô hình bảo vệ.
- Q: Trang đích navigation (Awards Information, Sun* Kudos) chưa build — xử lý link + hash-scroll? → A: Tạo placeholder routes `/awards`, `/kudos` (protected, tối giản) để link/CTA/hash-anchor hoạt động và E2E pass; thay bằng trang thật ở screen sau.
- Q: TC ID-25/26 kỳ vọng đổi ngôn ngữ dịch giao diện — scope i18n? → A: Giữ tiền lệ F001: language-selector chỉ toggle cookie NEXT_LOCALE + label, không dịch nội dung. Full i18n là hạng mục riêng (màn 12).
- Q: Bell/account menu/widget — backend notification + role system chưa có? → A: Stub + Sign out thật: bell mở panel rỗng, badge ẩn; account menu Profile (stub) + Sign out thật qua Supabase; Admin Dashboard ẩn (chưa có role system); widget mở menu stub.
- Q: Tên biến môi trường mốc thời gian sự kiện (spec B1: ISO-8601)? → A: `NEXT_PUBLIC_EVENT_START_AT` (auto-resolved, theo convention NEXT_PUBLIC_*). Thiếu/không hợp lệ → hiển thị 00 00 00, ẩn "Coming soon", console.warn, không crash (TC ID-60).
- Q: Event info text — Figma hiển thị "26/12/2025 / Âu Cơ Art Center / Livestream" nhưng spec CSV ghi "18h30 / Nhà hát nghệ thuật quân đội / Facebook Group"? → A: Theo Figma (MCP design data authoritative — MoMorph rule 1). FR-16 đã cập nhật; E2E assert theo text Figma. (auto-resolved)
