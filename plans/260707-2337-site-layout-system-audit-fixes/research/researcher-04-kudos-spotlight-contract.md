# Kudos Live-Board + Spotlight Board — Numeric Layout Contract

Source: live MoMorph MCP (`fileKey=9ypp4enmFmdK3YAFJLIu6C`). No skill from the catalog matched this
task directly (pure MoMorph data extraction, not implementation) — proceeded with MCP tools per
`.claude/rules/momorph/momorph-layout-system.md` directly (`get_frame`, `get_frame_node_tree` via
`get_overview`, `get_node`, `download_specs`). `get_figma_image` / `get_media_file` both failed
(500 / 401 Unauthorized) so no visual screenshot could be pulled — geometry below is numeric-only,
not screenshot-confirmed, per node-tree data which is itself authoritative per the layout rule.

## 1. Spotlight screenId — IMPORTANT FINDING

**There is no separate Spotlight screen.** `list_frames` on the fileKey returned 174 frames; none
named "Spotlight". The Spotlight board is a **section inside the same live-board screen**
(`MaZUn5xHXZ`, figma node `2940:13431`, name "Sun* Kudos - Live board"):

- Node `2940:14174`, name `B.7_Spotlight`, spec id `B.7` — sits inside `Frame 552` (`2940:14170`),
  itself inside `Bìa` (`2940:13434`), which is a direct child of the top-level live-board frame.
- Sibling section `B.6_Header Giải thưởng` (`2940:13476`) renders the "Sun* Annual Awards 2025" /
  "SPOTLIGHT BOARD" title row immediately above it, both in the same screen.

Treat "kudos live-board" and "Spotlight board" as **one screen, two sections** — not two screens.
Any plan phase that assumes a distinct Spotlight screenId is wrong; there is only `MaZUn5xHXZ`.

Full relevant frame list from `list_frames` (fileKey `9ypp4enmFmdK3YAFJLIu6C`), Kudos-related only:
`MaZUn5xHXZ` (Sun* Kudos - Live board, web/desktop — this is the one with Spotlight),
`fO0Kt19sZZ`+children (`[iOS] Sun*Kudos...` — separate mobile-app designs, not a responsive variant
of the web page), `Qhg3SUg_8L`/`49Qr2oIjMV` (KUDO card component), `n56Yyp7Klu` (KUDO - Highlight
card), `JYHZJyOwT-` (KUDO spam state), `RO7O6QOhfJ`/`JsTvi8KVQA` (Gửi lời chúc Kudos = compose
dialog), `ihQ26W78P2` (Viết Kudo), `onDIohs2bS` (View Kudo), `5c7PkAibyD` (error state),
`QJd9jB9PDt` (D1_Sunkudos — appears to be an early/alt homepage-embed variant, not fetched further,
out of scope for this ticket).

## 2. Viewport coverage — CRITICAL

The live-board frame is **1440px wide only** (`2940:13431`: width 1440px, height 5862px). No
1280 / 768 / 375 variant frame exists anywhere in the 174-frame list for this screen (the `[iOS]`
Kudos frames are a **different, separately-designed mobile app screen set**, not a responsive
breakpoint of this web page — different component structure entirely, not usable as a 375px
reference for this page).

**Verdict: 1280 / 768 / 375 = "not in design" for both the live-board and the Spotlight section.**
Any responsive behavior at those widths in the current code is an extrapolation, not a design
match — must be flagged as reconstruction, not verified against source.

## 3. Contract table — Kudos Live-Board (viewport: 1440 only; others not in design)

| viewport | frame width/height | left/right gutter | content max width | section height | padding top/bottom | gap | text block width | font-size/line-height/letter-spacing | bg layer/blur/crop/z-index |
|---|---|---|---|---|---|---|---|---|---|
| 1440 | 1440 × 5862 (`2940:13431`, bg `rgba(0,16,26,1)`) | **144px** (header row `B.6` padding `0 144 0 144`, node `2940:13476`) | **1152px** (1440 − 2×144, confirmed by title text node `2940:13477` width=1152) | Spotlight+header section (`Frame 552`, `2940:14170`): 791px (y 1450→2241) | header block height 129px (y1466→1595); gap header→board = 63px (1595→1658) | header internal gap 16px (flex column) | title text 1152px wide | see §5 typography | Section backdrop `Rectangle 60` (`2940:14169`): 1440×903, same navy `rgba(0,16,26,1)` as page — full-bleed flat color, not an image |
| 1280 | not in design | not in design | not in design | not in design | not in design | not in design | not in design | not in design | not in design |
| 768 | not in design | not in design | not in design | not in design | not in design | not in design | not in design | not in design | not in design |
| 375 | not in design | not in design | not in design | not in design | not in design | not in design | not in design | not in design | not in design |

## 4. Contract table — Spotlight Board (`B.7_Spotlight`, node `2940:14174`, viewport 1440 only)

| viewport | board width/height | left/right gutter (of board vs 1152 content column) | content max width it sits in | section height | padding | gap | text block width | font-size/line-height/letter-spacing | bg layer/blur/crop/z-index |
|---|---|---|---|---|---|---|---|---|---|
| 1440 | **1157 × 548px**, absolute at (142,1658)→(1299,2206) inside `Frame 552`; `border: 1px solid #998C5F`; `border-radius: 47.14px` | board left edge x=142 / right inset =1440−1299=141 → within ~2px of the 144px page gutter (rounding/border overhang, not a distinct gutter value) | sits inside the same 1152px content column as the rest of the page (not its own wider/narrower column) | 548px (board box only) | n/a (board is edge-to-edge card, no internal top/bottom padding token — children are individually absolute-positioned) | n/a | "388 KUDOS" text block 217px wide; search box 219px wide | see §5 | **3 stacked background rectangles + DOM text on top — see §6 for full breakdown** |
| 1280/768/375 | not in design | not in design | not in design | not in design | not in design | not in design | not in design | not in design | not in design |

## 5. Typography (1440, from live nodes)

| element | node | font-size | line-height | letter-spacing | weight/family | color |
|---|---|---|---|---|---|---|
| "Sun* Annual Awards 2025" (section title) | `2940:13477` | 24px | 32px | 0px | 700 Montserrat | white |
| "SPOTLIGHT BOARD" (subtitle) | `2940:13480` | 57px | 64px | −0.25px | 700 Montserrat | `#FFEA9E` (gold) |
| "388 KUDOS" counter | `3007:17482` | 36px | 44px | 0px | 700 Montserrat | white |
| Name-cloud text (base) | e.g. `2995:15926` | **6.656px** (also 7.937 / 10.205 / 11.339px tiers seen across dataset) | 6.358px (for the 6.656px tier) | 0.208px | 700 Montserrat | white/accent (per design) |
| Bottom ticker rows ("HH:MMxx Name đã nhận...") | `3004:15999` etc. | 14px | 20px | 0.1px | 700 Montserrat | white, **opacity graded 1→0.1 per row** |
| Search box "Tìm kiếm sunner" | `2940:14833` | n/a (icon+placeholder instance) | — | — | — | border `0.68px #998C5F`, bg `rgba(255,234,158,0.10)`, radius 46.4px, padding ~16.4×10.9px |

## 6. Spotlight background-layer stack — z-order (bottom→top, from Figma child order)

1. **`image 24`** (`2940:14178`) — RECTANGLE, 1098×617, positioned (192,1602)→(1290,2219). No
   background/fill data returned by MCP for this one specifically (style dump only showed size/
   position, no `background:` property — likely an image fill MCP didn't surface as CSS, or a
   plain shape). Pure decorative, no text children.
2. **`image 25`** (`2940:14181`) — RECTANGLE, 1100×618, `background: url(...) lightgray 50%/cover
   no-repeat`, `background-blend-mode: screen`, `aspect-ratio: 89/50`. Pure decorative image layer
   (the wave/network texture), no text children.
3. **`Root further mo rong 1`** (`2940:14173`) — RECTANGLE, **1819×618** — wider than the 1440
   viewport itself (positioned x:78→1897, clipped visually at x=1440), `background:
   linear-gradient(0deg, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.70) 100%), url(...) lightgray 50%/cover
   no-repeat`, `aspect-ratio: 78/25`. Name ("further mở rộng" = "further expanded") plus its
   oversize vs. the visible board strongly implies this is the **extended background used for the
   Pan/Zoom feature** (`B.7.2_Pan zoom`, spec: "Pan/Zoom: Hỗ trợ pan và zoom bằng nút 'Pan/Zoom' và
   thao tác chuột") — more background is revealed when zoomed/panned. Pure decorative, no text.
4. **Everything else in `B.7_Spotlight`** (rendered on top of the three background rects, per
   Figma child order) is **real content, not image**:
   - `B.7.1_388 KUDOS` — TEXT node.
   - `B.7.3_Tìm kiếm sunner` — INSTANCE (interactive search control).
   - **~120 individual TEXT nodes**, one per name occurrence (`Đỗ hoàng Hiệp`, `Dương thúy An`,
     `Mai phương Thúy`, `Lê Kiều Trang`, `Nguyễn Văn Quy`, `Nguyễn Bá Chức`, `Nguyễn Hoàng Linh`,
     repeated at different sizes/positions) — this is the word-cloud, and **every single name is
     its own DOM text node in the source design**, never baked into a bitmap.
   - `B.7.2_Pan zoom` — FRAME (button/control).
   - 6 ticker rows (`3004:15995`–`3004:15999` + one more) — TEXT nodes, opacity-graded.

**Spec confirms this split explicitly** (download_specs, item `B.7`, spec id `2940:14174`):
> "Bảng tương tác hiển thị tên người nhận Kudos dưới dạng **word cloud/diagram**. Display: Canvas:
> Vùng hiển thị nhiều tên nhỏ dàn trải - **interactive**... Function: Hover: Hiển thị tooltip với
> tên và thời gian nhận Kudos - Click node: Mở chi tiết Kudos tương ứng - Pan/Zoom: Hỗ trợ pan và
> zoom..."

Names are spec'd as **interactive** (hover tooltip, click-to-open) — that alone rules out baking
them into a flattened image; interactive behavior needs real DOM nodes.

## 7. CRITICAL ASSET AUDIT — crop vs DOM verdict

**Verdict: the crop bakes in content that must be DOM, and the current implementation already
half-fixes this but keeps a redundant/wrong-source crop underneath.**

Findings:
- The design's own layer structure (§6) already separates **3 pure-decorative background
  rectangles** (image 24, image 25, Root further mo rong 1 — no text, no fills except gradient/photo)
  from **~120+ real TEXT/INSTANCE nodes** for names, counter, search, ticker. The design itself
  draws this exact line: decorative-crop-OK vs must-be-DOM.
- `app/components/kudos/spotlight-name-cloud.tsx` + `lib/kudos/spotlight-name-cloud-slots.ts`
  already implement the DOM side correctly — 100 name slots as absolutely-positioned `<span>`
  elements with exported top/left/size, explicitly sourced from a prior MoMorph node-geometry
  export (comment cites `plans/260706-2200-sun-kudos-live-board/data/spotlight-export/
  node-geometry.json`). This part is architecturally right per the design's own split.
- `app/components/kudos/spotlight-collage-backdrop.tsx`'s own comment admits the problem: *"We do
  not have the isolated `image 25` background asset as a clean PNG, only the flattened board crop
  ... this uses that crop as a blurred/darkened reference layer ... pushing the baked text/UI far
  enough into the background."* This means `public/kudos/spotlight-crop.png` (1205×596) is a
  **flattened screenshot of the whole rendered board — names and all** — used as the background,
  sitting directly underneath the correct DOM name-cloud. Result: **the same names render twice**
  (once crisp/DOM from `spotlight-name-cloud.tsx`, once baked/blurred into the crop behind it),
  and the crop's own baked text is exactly the kind of content the asset rule forbids in a
  decorative layer, mitigation-by-blur/darken notwithstanding.
- Geometry mismatch confirms the crop isn't a clean export of any single named layer: 1205×596
  (ratio 2.022) matches none of image24 (1098×617, 1.780), image25 (1100×618, 1.780), Root further
  mo rong 1 (1819×618, 2.943), or the board itself (1157×548, 2.111) at a consistent per-axis
  scale — it was manually screenshotted/cropped at an arbitrary boundary, not pulled from Figma
  node export tooling. `get_figma_image`/`get_media_file` both failed for this project (500 /
  401), so a clean re-export of `image 25` (or `image 24`) could not be produced in this research
  pass — that gap needs a working Figma export credential before implementation, not a code fix.

**Correct layer split (target state):**
1. Bottom: decorative background image(s) only — `image 24` + `image 25` (+ optionally the
   oversized `Root further mo rong 1` for the Pan/Zoom extended view) with **zero baked text**.
   These may remain raster crops once cleanly exported — they contain no names, no UI.
   A flat navy background-color fallback (`rgba(0,16,26,1)`, matching `Rectangle 60`) is an
   acceptable placeholder until a clean export exists — safer than a text-baked crop.
2. Top: `SpotlightNameCloud` (already correct) + `388 KUDOS` counter + search box + Pan/Zoom
   button + ticker — all DOM, unchanged.
3. **Action implied (not to be implemented here, research only):** stop using
   `spotlight-crop.png` as-is (or at minimum strip/replace it with a plain gradient/flat-color
   backdrop) until a genuinely clean, name-free background export exists, since the current crop
   both violates the asset rule and duplicates the DOM name-cloud underneath it.

## 8. Single gutter / single content max-width verdict

- **Design-implied values at 1440: gutter = 144px, content max-width = 1152px.**
- **Current shared primitives** (`app/components/layout/page-layout.tsx`):
  `PageGutter` = `px-6 sm:px-10 lg:px-36` → **144px at `lg:` (≥1024px, so also holds at 1440)**.
  `ContentFrame` width option `1152` exists and is what `kudos-board.tsx` uses.
- **No divergence for Kudos at 1440.** `PageGutter` + `ContentFrame width={1152}` in
  `app/components/kudos/kudos-board.tsx` line up exactly with the live design's 144px gutter /
  1152px content column. This screen does NOT need a gutter/max-width fix — the primitive is
  already correct here; the finding for this ticket is the **Spotlight asset layering issue
  (§7)**, not the page-level gutter/width contract.
- Caveat: since the design has no 1280/768/375 frame, the `sm:px-10` (40px) and base `px-6` (24px)
  tiers of the shared gutter primitive are **not verifiable against this screen** — they're
  inherited from the site-wide primitive, not from Kudos-specific design data. Fine to keep as-is
  (consistent with other audited screens per the layout-system doc), just noting it's unverified
  for this particular screen.

## 9. Mismatch classification (per layout-system doc §5)

| # | Item | Mismatch type | Verdict |
|---|---|---|---|
| 1 | `spotlight-crop.png` bakes in names/UI | **wrong image crop** | Confirmed defect — background layer contains content that must be DOM per design's own layer split and the B.7 spec's "interactive" requirement |
| 2 | Kudos page gutter (144px) | none | Matches design exactly — no mismatch |
| 3 | Kudos content max-width (1152px) | none | Matches design exactly — no mismatch |
| 4 | Board container width 1157px vs page's 1152px content column | **not a mismatch** — board's own 1px border pushes visual box to ~1157/1158; content-box sits within the 1152 column as expected | No action needed, note only |
| 5 | 1280/768/375 breakpoints for Kudos/Spotlight | **wrong viewport constraint (N/A)** — no source data exists | Cannot classify further; any responsive CSS at these widths is unverified reconstruction, flag explicitly wherever it appears in code |

## Unresolved questions

1. `get_figma_image` and `get_media_file` both failed (500 / 401 Unauthorized) for this fileKey —
   could not export a clean PNG of `image 24` / `image 25` / `Root further mo rong 1` to confirm
   visually they truly contain zero baked text, or to produce a replacement asset. Recommend
   retrying with valid Figma auth before any implementation touches the backdrop.
2. Exact pixel data for `image 24`'s fill (no `background:` CSS was returned by MCP for that node,
   unlike its two siblings) — unclear if it's a second photo layer or a solid/gradient shape;
   needs the image export above to confirm.
3. Divider height/style for `Rectangle 26` inside `B.6_Header` (title/subtitle divider) was not
   pulled — not required for the two contract tables requested, but relevant if header spacing is
   audited later.
