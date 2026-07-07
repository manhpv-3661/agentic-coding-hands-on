---
feature: F001
name: Đăng nhập (Login) — SAA 2025
lang: vi
screen: Login
momorph:
  fileKey: 9ypp4enmFmdK3YAFJLIu6C
  screenId: GzbNeVGJHz
status: active
---

# F001 — Màn hình Đăng nhập (Login)

## 1. Tổng quan

Màn hình đăng nhập của ứng dụng **SAA 2025** (Sun* Annual Awards 2025). Người dùng chưa
xác thực đăng nhập bằng tài khoản Google (thông qua **Supabase Auth**). Sau khi xác thực
thành công, hệ thống chuyển hướng về trang chính `/` (cập nhật từ `/todo` — xem F002).

Bố cục: header cố định (logo trái + bộ chọn ngôn ngữ phải), khu vực nội dung chính (hero
visual + khối giới thiệu + nút đăng nhập), footer bản quyền ở cuối trang.

## 2. Yêu cầu chức năng

### 2.1 Kiểm soát truy cập (Access Control)
- **FR-1**: Người dùng **chưa đăng nhập** truy cập `/login` → hiển thị màn hình đăng nhập.
- **FR-2**: Người dùng **đã đăng nhập** truy cập `/login` → tự động chuyển hướng về `/` (cập nhật từ
  `/todo` — xem F002).
- **FR-3**: Sau khi **đăng xuất** từ trang đã xác thực → chuyển hướng về `/login`.
- **FR-4**: Trang `/todo` được bảo vệ: người dùng chưa đăng nhập → chuyển hướng về `/login`.

### 2.2 Đăng nhập với Google (Supabase Auth)
- **FR-5**: Nhấn nút **"LOGIN With Google"** → khởi động luồng Google OAuth qua Supabase
  (`signInWithOAuth({ provider: 'google' })`), `redirectTo` trỏ về `/auth/callback`.
- **FR-6**: Trong khi xử lý xác thực, nút **bị vô hiệu hóa** và hiển thị **loading indicator** (spinner).
- **FR-7**: Xác thực thành công → route `/auth/callback` đổi code lấy session → chuyển hướng về `/`
  (cập nhật từ `/todo` — xem F002).
- **FR-8**: Xác thực thất bại hoặc người dùng hủy → hiển thị thông báo lỗi:
  **"Đăng nhập không thành công. Vui lòng thử lại."**
- **FR-9**: Mọi tài khoản Google đều được phép đăng nhập (không giới hạn domain).

### 2.3 Bộ chọn ngôn ngữ (Language Selector)
- **FR-10**: Header hiển thị bộ chọn ngôn ngữ ở góc phải: cờ Việt Nam + nhãn **"VN"** + mũi tên chevron.
- **FR-11**: Mặc định ngôn ngữ là **VN** (Tiếng Việt).
- **FR-12**: Nhấn vào bộ chọn → mở dropdown danh sách ngôn ngữ (VN, EN); hover đổi con trỏ thành pointer + highlight.
- **FR-13**: Chọn ngôn ngữ → ghi cookie **`NEXT_LOCALE`** với mã ngôn ngữ (VN/EN).
- **Phạm vi (đã chốt)**: chỉ làm **UI selector + cookie**. Dịch toàn bộ giao diện (i18n đầy đủ)
  được **hoãn sang màn hình 12 (Đa ngôn ngữ VI/EN)**. Nội dung Login giữ nguyên tiếng Việt theo Figma.

## 3. Cấu trúc UI (theo Figma — pixel-perfect)

| # | Item | Mô tả |
|---|------|-------|
| A | Header (sticky) | Container cố định đầu trang, nền tối |
| A.1 | Brand Logo | Logo Sun* Annual Awards 2025, góc trên trái, tĩnh (không click) |
| A.2 | Language Selector | Cờ VN + "VN" + chevron, góc trên phải, dropdown VN/EN |
| B | Main Login Section | Khu vực giữa header–footer |
| B.1 | Hero Visual | Ảnh trừu tượng sóng màu (vàng/cam/xanh lá/xanh dương/tím) trên nền tối, phủ phải + trên |
| B.2 | Introduction Content Block | Title "ROOT FURTHER"; subtitle "Bắt đầu hành trình của bạn cùng SAA 2025."; tagline "Đăng nhập để khám phá!" |
| B.3 | Login Button | Nút vàng nhạt, icon Google + "LOGIN With Google", đậm; hover có shadow/elevation; hỗ trợ trạng thái loading/disabled |
| D | Footer | "Bản quyền thuộc về Sun* © 2025", căn giữa, nền tối |

## 4. Yêu cầu phi chức năng
- **UI khớp Figma** (Definition of Done của dự án).
- Responsive: logo trái / selector phải / footer đáy giữ vị trí ở mọi kích thước cửa sổ.
- Truy cập an toàn: session lưu qua Supabase SSR (cookie), middleware refresh session.
- Code degrade gracefully khi thiếu env Supabase (build/test không crash).

## 5. Kiến trúc & luồng (tóm tắt — chi tiết ở docs/system)
```
/login (chưa auth) --click Login--> supabase.signInWithOAuth(google, redirectTo=/auth/callback)
   --> Google consent --> /auth/callback (exchangeCodeForSession) --> redirect /
middleware: refresh session; /login + đã-auth -> / ; /todo + chưa-auth -> /login
```

## 6. Tiêu chí chấp nhận (Acceptance Criteria)
- [ ] Toàn bộ 8 design item hiển thị đúng vị trí, màu, font, spacing như Figma.
- [ ] 17 test case của MoMorph đều pass (unit + E2E theo TDD).
- [ ] Nút Login: click → loading/disabled → OAuth; lỗi hiển thị đúng thông báo.
- [ ] Người dùng đã auth truy cập /login → redirect /; chưa auth truy cập /todo → redirect /login.
- [ ] Language selector mở dropdown, ghi cookie NEXT_LOCALE, mặc định VN.

## 7. Câu hỏi chưa giải quyết
- Phạm vi i18n: đã default "chỉ selector + cookie" (câu trả lời của user không đề cập rõ) — cần user xác nhận.
- **Đã shipped**: hạng mục "hoãn sang màn hình 12" nói ở FR-13 nay đã triển khai đầy đủ ở F005 —
  xem `docs/features/f005-i18n-translation/feature.md`.

## 8. Thiết lập môi trường (đã triển khai)
- Copy `.env.local.example` → `.env.local`, điền `NEXT_PUBLIC_SUPABASE_URL` +
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Dashboard → Project Settings → API).
- Bật Google provider: Supabase Dashboard → Authentication → Providers → Google.
- Thêm `http://localhost:3000/auth/callback` vào Authentication → URL Configuration → Redirect URLs.
- Thiếu env: app vẫn build/chạy (fail-open, xem `docs/system/permissions.md` § Bảo mật) nhưng đăng nhập
  thực tế sẽ không hoạt động.
