## Session 2026-07-06

- Q: Cơ chế i18n: dictionary tự viết hay cài next-intl? → A: Dictionary tự viết (JSON/TS object + hàm đọc cookie NEXT_LOCALE) — ứng dụng nhỏ, 2 ngôn ngữ, không cần pluralization/ICU phức tạp; next-intl thường kéo theo route-based locale routing không khớp cơ chế cookie đã chốt ở F001.
- Q: Khi đổi ngôn ngữ, cơ chế re-render nào? → A: router.refresh() sau khi ghi cookie — re-fetch RSC payload với cookie mới, không mất client state, mượt hơn full reload.
- Q: Pull-quote "A tree with deep roots fears no storm" (Cây sâu bén rễ... - Ngạn ngữ Anh) hiển thị sao ở locale EN? → A: EN chỉ hiện quote, bỏ phần ngoặc VI back-translation. VI giữ nguyên cả hai phần.
- Q: Các nhãn đã sẵn tiếng Anh (nav, Profile/Sign out, eyebrow) có đưa vào dictionary để dịch VI không? → A: Có, dịch hầu hết sang VI — trừ tên thương hiệu (Sun*, SAA, Kudos), tên hạng mục giải (Top Talent...), và eyebrow "Sun* annual awards 2025" (brand+year caption) giữ nguyên mọi locale.
- Q: Nhãn đếm ngược DAYS/HOURS/MINUTES dịch sang NGÀY/GIỜ/PHÚT hay giữ tiếng Anh? → A: Dịch sang NGÀY/GIỜ/PHÚT khi VI — đồng bộ với quyết định dịch hết UI, tránh nửa VI nửa EN.
- Q: 3 mô tả giải trùng nhau (chưa hoàn thiện, Figma gốc) dịch ngay hay chờ content thật? → A: Dịch ngay theo đúng y VI hiện có, EN cũng dùng chung 1 bản dịch (mirror) — giữ tinh thần "không tự chế nội dung" đã áp dụng ở F002/F004.
- Q: Ngày/giờ sự kiện (26/12/2025, tháng 11/2025) xử lý sao? → A: Translation-as-data (chuỗi format sẵn theo locale) — nhất quán cách xử lý số lượng/giá trị giải ở F004, không build formatter chung (YAGNI).
