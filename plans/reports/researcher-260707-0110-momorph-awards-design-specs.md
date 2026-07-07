# MoMorph "Hệ thống giải" (Awards) — Visual Ground Truth

**Source:** live MoMorph MCP pull, fileKey `9ypp4enmFmdK3YAFJLIu6C`, screenId `zFYDgyj_pD`, figma node `313:8436`, revision `bd17cac2…`. Route under comparison: `/awards`.
**Confidence:** EXTRACTED (all values read directly from Figma node styles via MCP).

## 3. Frame canvas

| Property | Value |
|---|---|
| Canvas | **1440 × 6410 px** |
| Page background | `#00101A` (rgba(0,16,26,1)) |
| Content wrapper "Bìa" | 1440 w, y 88–6252, `padding: 96px 144px`, column, `gap: 120px` → content column **1152px** (x 144–1296) |
| Cover gradient overlay | y 0–627, `linear-gradient(0deg, #00101A -4.23%, rgba(0,19,32,0) 52.79%)` (sits over keyvisual, z above) |

Vertical rhythm (all gaps = 120px between sections): ROOT-Further logo y184–334 → Title y454–583 → Awards section y703–5536 → Kudos promo y5656–6156 → Footer y6266–6410.

## 1. Per-section specs

### Header (`313:8440`, y 0–80, fixed-style bar)
| Prop | Value |
|---|---|
| Size / padding | 1440×80, `padding: 12px 144px`, flex row, space-between, align center |
| Background | `rgba(16,20,23,0.8)` (#101417 @ 80%) |
| Logo | 52×48 image, left |
| Nav links (3) | gap 64 logo→nav, nav items gap 24; each item padding 16, gap 4, radius 4 |
| Nav label typography | Montserrat 700, 16/24, letterSpacing 0.15px, white `#FFF` |
| Active nav ("Award Information") | color `#FFEA9E`, `border-bottom: 1px solid #FFEA9E`, `text-shadow: 0 4px 4px rgba(0,0,0,.25), 0 0 6px #FAE287` |
| Right cluster (gap 16) | Notification 40×40 icon button (24 icon, padding 10, radius 4, transparent bg) + red dot badge 8×8 `#D4271D` (radius 100px, top-right); Language "VN" 108×56 button (padding 16, radius 4, 16/24 700 white + 24px Down chevron); Profile 40×40 button `border: 1px solid #998C5F`, radius 4, transparent bg, 24px user icon |

Header nav labels: `About SAA 2025` (inactive), `Award Information` (active), `Sun* Kudos` (inactive, 14/20 letterSpacing 0.1px).

### Hero keyvisual (`313:8437` / image `2167:5138`)
| Prop | Value |
|---|---|
| Geometry | 1440×547, y 80–627, full-bleed RECTANGLE, `background: url(...) cover` (aspect-ratio 437/166 source) |
| Overlay | Cover gradient (see above) fades bottom into `#00101A` |
| No text/CTA inside hero | Logo + titles live in the content column below |

### ROOT Further logo block (`313:8450` "KV")
Single image `MM_MEDIA_Root Further Logo`, **338×150**, left-aligned at x144, y184 (aspect 169/75).

### Section title (`313:8453`, 1152×129, column gap 16)
| Element | Spec |
|---|---|
| Caption "Sun* Annual Awards 2025" | Montserrat 700, **24/32**, letterSpacing 0, **center**, white `#FFF`, full 1152 width |
| Divider | 1152×1 `#2E3940` |
| Heading "Hệ thống giải thưởng SAA 2025" | Montserrat 700, **57/64**, letterSpacing **-0.25px**, color **`#FFEA9E`**, centered row (gap 32, justify center), 64px tall |

### Awards section (`313:8458` "mms_B", y 703–5536)
Flex row, `gap: 80px`, space-between: left menu **178px**, right list **853px** (cards render 856 wide, x 443–1299).

#### Left nav menu (`313:8459` "mms_C_Menu list", 178×448, column gap 16)
6 items, each: flex row, `padding: 16px`, `gap: 4px`, align center; leading **24×24 `MM_MEDIA_Target` icon**; label Montserrat 700, **14/20**, letterSpacing 0.25px.

| # | Label (character) | State | Extra |
|---|---|---|---|
| C.1 | `Top Talent` | **Active** | text `#FFEA9E`, `text-shadow: 0 4px 4px rgba(0,0,0,.25), 0 0 6px #FAE287`, `border-bottom: 1px solid #FFEA9E` (no radius) |
| C.2 | `Top Project` | inactive | white text, `border-radius: 4px`, no border |
| C.3 | `Top Project\nLeader` | inactive | 2-line (72px item) |
| C.4 | `Best Manager` | inactive | |
| C.5 | `Signature 2025 \nCreator` | inactive | 2-line (72px item) |
| C.6 | `MVP` | inactive | |

#### Award detail cards (D.1–D.6, each 856 wide, column gap 80, + 853×1 `#2E3940` bottom divider except D.6)
Two mirrored component variants (set `214:2647`): **214:2554 = image LEFT / content RIGHT** (D.1 Top Talent, D.3 Top Project Leader, D.5 Signature) and **214:2646 = content LEFT / image RIGHT** (D.2 Top Project, D.4 Best Manager, D.6 MVP). Inner row `gap: 40px`.

**Image slot ("Picture-Award", component 81:2443):**
- **336×336**, `border-radius: 24px`, `border: 0.955px solid #FFEA9E`
- `box-shadow: 0 4px 4px rgba(0,0,0,.25), 0 0 6px #FAE287` (gold glow), `mix-blend-mode: screen`
- Background photo (`mm_media_Award-Thumb-Background`) + centered award-name overlay image (~221×35, `mm_media_Award-Name-*`)

**Content column (480 wide, `border-radius: 16px`, `backdrop-filter: blur(32px)`, column gap 32, NO visible bg/border):**
| Element | Spec |
|---|---|
| Title row | 24×24 Target icon + gap 16 + title Montserrat 700 **24/32**, color **`#FFEA9E`** |
| Description | Montserrat **700**, **16/24**, letterSpacing 0.5px, `text-align: justify`, white, 480 wide (gap 24 under title) |
| Divider ×2 | 480×1 `#2E3940` (above and below the quantity row) |
| Quantity row | 24×24 Diamond icon + gap 16 + label `Số lượng giải thưởng:` Montserrat 700 24/32 `#FFEA9E` + value (`10`/`01`) + unit (`Cá nhân` / `Đơn vị` / `Cá nhân hoặc tập thể`) Montserrat 700 14/20 letterSpacing 0.1px white, gap 8 |
| Prize block | 24×24 License icon + gap 16 + label `Giá trị giải thưởng:` 24/32 700 `#FFEA9E`; prize value Montserrat 700 **36/44**, letterSpacing 0, **white** (e.g. `7.000.000 VNĐ `); sub-line `cho mỗi giải thưởng` 14/20 700 letterSpacing 0.1px white; internal gaps 16/24 |

**Per-card geometry:** D.1 y703–1334 (h631) · D.2 y1414–2093 (h679) · D.3 y2173–2852 (h679) · D.4 y2932–3599 (h667) · D.5 y3679–4726 (h1047, plain FRAME not instance) · D.6 y4806–5536 (h730, **no bottom divider**).

**D.5 Signature 2025 - Creator specifics:** title `Signature 2025 - Creator`; real description (Creator theme); quantity `01` / `Cá nhân hoặc tập thể`; **two prize blocks** separated by text `Hoặc` (14/20 700 white): `5.000.000 VNĐ` + `cho giải cá nhân`, then `8.000.000 VNĐ` + `cho giải tập thể`.

**PLACEHOLDER WARNING (design-side):** in the stored design data, cards D.2, D.3, D.4, D.6 carry the component-default copy — title `Top Talent`, the Top Talent description, `10`, `7.000.000 VNĐ` — i.e. instance text overrides were never applied in Figma. Only D.1 and D.5 have authoritative copy. For pixel comparison, treat **layout/typography/colors** of D.2–D.4/D.6 as ground truth, but NOT their text content (real names come from nav labels: Top Project, Top Project Leader, Best Manager, MVP; D.2/D.4/D.6 unit = `Đơn vị`, D.6 prize sub-line absent from text dump but structure matches).

### Sun* Kudos promo (`335:12023`, 1152×500, y 5656–6156)
| Element | Spec |
|---|---|
| Container | 1152×500, background image `MM_MEDIA_Kudos Background` over `#0F0F0F`, `border-radius: 16px` |
| Content column | 470×408 at x209 (65px inset), column, gap 32 |
| Caption | `Phong trào ghi nhận ` — Montserrat 700 **24/32**, white |
| Heading | `Sun* Kudos` — Montserrat 700 **57/64**, letterSpacing -0.25px, **`#FFEA9E`** |
| Body | 457 wide, Montserrat 700 **16/24**, letterSpacing 0.5px, justify, white; first line `ĐIỂM MỚI CỦA SAA 2025` then paragraph (triển khai 11/2025…) |
| CTA button | `Chi tiết` — 126×56, **bg `#FFEA9E`**, `border-radius: 4px`, padding 16, gap 8; label Montserrat 700 16/24 letterSpacing 0.15px, color **`#00101A`**; trailing 24×24 `Up` arrow icon |
| Right art | `KUDOS` logotype group 383×72 at right (SVN-Gotham ~96px, color `#DBD1C1`, letterSpacing -13%) + decorative frame 272×219 |

### Footer (`354:4323`, y 6266–6410, h144)
| Prop | Value |
|---|---|
| Container | 1440 w, `padding: 40px 90px`, `border-top: 1px solid #2E3940`, flex row space-between, align center |
| Logo | 69×64 image, left |
| Links (gap 48, logo→links gap 80) | 4 items, padding 16, Montserrat 700 16/24 letterSpacing 0.15px white: `About SAA 2025` · `Award Information` (active: bg `rgba(255,234,158,0.10)`, text-shadow glow `0 0 6px #FAE287`) · `Sun* Kudos` · `Tiêu chuẩn chung` |
| Copyright | `Bản quyền thuộc về Sun* © 2025` — **Montserrat Alternates** 700, 16/24, center, white, right side |

## 2. Element inventory (missing-element checklist)

- **Header:** logo image · 3 nav links (About SAA 2025 / Award Information [active underline+gold+glow] / Sun* Kudos) · notification bell button with red dot badge · language selector "VN" + chevron · profile icon button with #998C5F border.
- **Hero:** full-bleed keyvisual image (547px) · bottom fade gradient into #00101A.
- **Logo block:** ROOT Further logo image 338×150 (left-aligned, NOT centered).
- **Title block:** centered white caption 24px · 1152×1 divider · centered gold 57px heading.
- **Left menu:** exactly 6 items, each Target icon (24) + label 14px/700; active = gold text + glow + 1px gold bottom border; inactive = white, radius 4.
- **Each award card (×6):** 336×336 rounded-24 gold-border glowing image with award-name overlay · Target icon + gold 24px title · justified bold 16px white description · divider · Diamond icon + gold "Số lượng giải thưởng:" + white count + small unit text · divider · License icon + gold "Giá trị giải thưởng:" + 36px white prize + 14px sub-line · 853×1 divider under card (absent after D.6). Sides alternate: img L (D.1) → img R (D.2) → img L (D.3) → img R (D.4) → img L (D.5) → img R (D.6). D.5 additionally has "Hoặc" + a second prize block.
- **Kudos promo:** rounded-16 background-image panel · caption · gold 57px heading · bold body with "ĐIỂM MỚI CỦA SAA 2025" lead · gold "Chi tiết" button + arrow icon · KUDOS logotype art on the right.
- **Footer:** border-top divider · logo · 4 links (Award Information highlighted with 10% gold bg) · Montserrat Alternates copyright.

## Design-token summary
| Token | Value |
|---|---|
| Details-Text-Primary-1 (gold) | `#FFEA9E` |
| Gold glow | `0 4px 4px rgba(0,0,0,.25), 0 0 6px #FAE287` |
| Details-Divider | `#2E3940` |
| Details-Border (profile btn) | `#998C5F` |
| Page bg | `#00101A` |
| Header bg | `rgba(16,20,23,0.8)` |
| Notification badge | `#D4271D` |
| Font | Montserrat, 700 everywhere (footer copyright: Montserrat Alternates) |
| Radii | 4px buttons/nav · 16px card content & kudos panel · 24px award image |

---
**Status:** DONE
**Summary:** Full visual ground truth extracted live from MoMorph (canvas 1440×6410, all section colors/typography/radii/spacing, 6 nav items, 6 card geometries with alternating layout, kudos promo, header/footer) — ready for pixel comparison against `/awards`.
**Concerns/Blockers:** Figma itself holds placeholder copy for cards D.2/D.3/D.4/D.6 (component-default "Top Talent" text, unoverridden) — compare layout/style, not text, for those cards. Image URLs are redacted by MCP (`<path-to-image>`), so image-content diffing needs `get_frame_image`/media tools if required later.
