This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Development Commands

Typecheck:

```bash
npx tsc --noEmit
```

Lint toàn bộ:

```bash
npm run lint
```

Test toàn bộ (một lần, không watch):

```bash
npx vitest run
```

Test 1 file/thư mục cụ thể:

```bash
npx vitest run app/components/kudos
```

Build production (bị agent-sandbox chặn với tôi, nhưng bạn chạy bình thường):

```bash
npm run build
```

Restart dev server:

```bash
pkill -f "next dev"; npm run dev
```

E2E Playwright (nhớ tắt dev server đang chạy trước, vì e2e tự build+start server riêng ở port 3000/3100/3200):

```bash
pkill -f "next dev"; npm run e2e
```

## Nộp bài — AIDD Mock Project (SAA 2025 Web)

### 1. GitHub URL

`https://github.com/manhpv-3661/agentic-coding-hands-on`

> ⚠️ Repo hiện đang **private** — cần chuyển sang **public** trước khi nộp để Trainer xem/chấm được.

### 2. Link demo

Chưa deploy — dự án chỉ chạy local qua `npm run dev` (`http://localhost:3000`). Không có bản demo online.

### 3. Miêu tả các tác vụ có sử dụng Copilot

N/A — không dùng Copilot trong dự án này.

### 4. Miêu tả các tác vụ có sử dụng Claude Code

Toàn bộ 8 màn hình đều được code bằng Claude Code + Takumi Agent Kit, bám spec/test case kéo
từ MoMorph (Figma): Login, Homepage SAA, Hệ thống giải, Countdown Prelaunch, Đa ngôn ngữ
(VI/EN), Sun\* Kudos Live Board, Viết Kudos, Like Kudos. Ngoài UI còn dùng Claude Code cho:
pivot backend từ mock data tĩnh sang Supabase Postgres thật, một đợt audit lại toàn bộ layout
system (gutter/content-width) sau khi phát hiện lỗi hệ thống, viết toàn bộ unit test (Vitest) và
e2e test (Playwright), và ghi docs/changelog/journal theo từng feature.

### 5. Miêu tả kỹ về flow gen ra code

Theo flow chuẩn của Takumi (`primary-workflow.md`):

1. **Lấy design source**: MoMorph MCP fetch `get_frame` + `download_specs` (CSV) +
   `download_test_cases` (CSV) cho screenId tương ứng.
2. **Clarification Protocol**: đọc kỹ specs + test cases, đối chiếu tìm khoảng trống (error
   state, navigation, validation, empty/loading state...). Ở chế độ có giám sát thì hỏi lại qua
   `AskUserQuestion`; ở các phiên `--auto` chạy qua đêm thì tự chọn phương án theo quy tắc "đã có
   pattern trong repo thì theo pattern đó, chưa có thì khoanh ngoài phạm vi".
3. **Planner**: sinh plan nhiều phase trong `plans/{timestamp}-{slug}/`, kèm phase file chi tiết
   (requirements, kiến trúc, file liên quan, todo, tiêu chí done).
4. **Implementer**: thực thi từng phase (UI dùng mock data trực tiếp từ design, không bịa dữ
   liệu); khi cần cả UI lẫn backend thì chạy song song 2 track độc lập.
5. **Tester**: `tsc --noEmit`, `vitest run`, `next build`, `eslint` — fail thì sửa và chạy lại,
   không bỏ qua test đỏ.
6. **Reviewer**: chấm điểm, tìm lỗi correctness/style/security/kiến trúc trước khi seal.
7. **Doc-writer**: promote spec đã chốt vào `docs/features/{fxxx}/feature.md`, ghi
   `docs/project-changelog.md` và một journal bài học (`docs/journals/`) cho mỗi feature.

### 6. Những khó khăn đã gặp phải và giải pháp

- **Token MoMorph MCP hết hạn giữa chừng** (auth qua GitHub token trong `~/.claude.json`) →
  phải `gh auth login` lại, patch token, restart Claude Code. Lặp lại nhiều lần, chưa có fix
  cố định.
- **Lỗi hệ thống ở layout, không phải lỗi từng màn**: sửa pixel-conformance từng component lại
  làm hỏng màn khác, vì mỗi component tự quyết định gutter/max-width riêng thay vì dùng chung 1
  primitive. Giải pháp: dừng lại làm hẳn 1 đợt audit (`plans/260707-2337-site-layout-system-audit-fixes/`)
  — dựng bảng số liệu (gutter, content width, spacing...) đo trực tiếp từ MoMorph, đối chiếu DOM
  thật qua Playwright ở 4 breakpoint, quy `PageGutter`/`ContentFrame` về 1 chủ sở hữu duy nhất,
  sửa theo thứ tự site-shell → từng màn.
- **2 phiên `--auto` chạy song song build trùng 1 feature** (Like Kudos, F008): do lệnh
  "continue" bị hiểu nhầm thành phiên mới, cả 2 cùng sửa chung working tree, ghi đè file của
  nhau giữa chừng verify. Giải pháp: nhận ra revert lặp lại có chủ đích (không phải race ngẫu
  nhiên), để phiên commit trước thắng, phiên còn lại verify độc lập lại commit đó thay vì tranh
  giành sửa tiếp.
- **git-manager tự bịa nội dung commit message** không khớp diff thật (và có lúc dính
  `Co-Authored-By` vi phạm quy tắc "không nhắc AI") → bắt được khi review trước khi merge, từ đó
  luôn đối chiếu message với diff thật trước khi chấp nhận.
- **Đổi hướng responsive giữa chừng**: user yêu cầu bỏ hết breakpoint, chỉ làm cho desktop → phải
  quét lại toàn repo gỡ `sm:`/`md:`/`lg:`/`xl:`.
- **Pivot backend giữa chừng** (Kudos, Awards, dữ liệu sự kiện): từ mock array tĩnh sang Supabase
  Postgres thật → dùng pattern `isSupabaseConfigured()` để fallback về mock cũ khi chưa cấu hình
  env, tránh vỡ e2e test.

### 7. Đánh giá chất lượng gen specs, test case, code

- **Specs + test case (MoMorph)**: đủ chi tiết để làm hợp đồng viết unit/e2e test, nhưng đôi khi
  spec chữ lệch với ảnh thiết kế thật — ví dụ F006: spec ghi sidebar thống kê 4 dòng nhưng ảnh
  thiết kế cho thấy 5 dòng; spec ghi nút "Mở quà" nhưng ảnh ghi "Mở Secret Box". Quy tắc áp dụng:
  ảnh thiết kế/MoMorph live thắng spec chữ khi mâu thuẫn.
- **Code gen**: chạy đúng chức năng, coverage tốt (70+ file unit test, 12 file e2e), nhưng lần
  đầu implement từng màn riêng lẻ đã tạo lỗi hệ thống ở layout (mỗi màn tự suy ra gutter/width từ
  ảnh crop thay vì theo 1 design system chung) — cho thấy code gen ban đầu ưu tiên "giống ảnh cục
  bộ" hơn là nhất quán toàn site; phải có 1 đợt audit riêng để sửa tận gốc.

### 8. Đánh giá hiệu quả Takumi + MoMorph

Tổng thể tích cực: 1 người hoàn thành 8 màn hình đầy đủ spec + test trong vài ngày, nhiều phần
chạy `--auto` qua đêm không cần giám sát. MoMorph cho spec + test case có cấu trúc thay vì phải
đoán từ ảnh chụp màn hình, giúp viết test case bám sát yêu cầu hơn. Nhưng hiệu quả phụ thuộc
nhiều vào kỷ luật đặt ra thêm ngoài vòng lặp gen mặc định: phải tự định nghĩa "nguồn sự thật"
(design live thắng ảnh crop), tự override mặc định "viết test mỗi phase" để khỏi lãng phí khi
đang pivot backend nhanh, và tự bắt lỗi commit message bịa đặt trước khi merge.

### 9. Feedback cho Takumi

- Nhiều phiên `--auto` chạy song song không có cơ chế khóa hay nhận biết lẫn nhau — cần cảnh báo
  hoặc chặn khi phát hiện 2 phiên đang sửa cùng working tree/cùng feature.
- `git-manager` đôi khi tự viết commit message có tính năng không tồn tại trong code thật — nên
  có bước tự đối chiếu message với diff thật trước khi commit, không chỉ dựa vào file list.
- Chain mặc định Implementation → Testing mỗi phase đôi khi lãng phí khi đang lặp nhanh trên
  logic/layout chưa ổn định — nên dễ tắt/bật theo ngữ cảnh hơn là phải nói lại mỗi lần.

### 10. Feedback cho MoMorph

- Token MCP auth (qua GitHub token trong `~/.claude.json`) hay hết hạn giữa chừng, phải
  `gh auth login` lại + patch + restart thủ công — ma sát lặp lại nhiều lần trong dự án.
- Spec chữ đôi khi lệch với ảnh thiết kế thật (số liệu, câu chữ nút) — nên có bước tự đối chiếu
  spec text với ảnh trước khi xuất, thay vì để người dùng tự phát hiện qua review.
- Spec/test case xuất theo từng screen riêng lẻ, chưa có khái niệm "design primitive dùng chung
  nhiều màn" (gutter, content width, typography scale) — phải tự dựng và audit lại tầng đó ở
  phía code sau khi lỗi layout xuất hiện.

### 11. Ý kiến khác

Rubric chấm điểm và định nghĩa chính xác "nộp bài" (link fork? PR lên upstream? chỉ báo cáo giờ
trên Slack?) không có trong repo — cần xác nhận trực tiếp với PIC. Effort thực tế cao hơn ước
lượng ban đầu (40h) do các đợt lặp lại: audit layout system, pivot backend Supabase, và xử lý
xung đột giữa các phiên `--auto` chạy song song.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
