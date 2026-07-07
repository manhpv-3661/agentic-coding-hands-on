---
type: researcher-report
date: 2026-07-07
topic: MoMorph "Sun* Kudos - Live board" visual ground truth (fileKey 9ypp4enmFmdK3YAFJLIu6C, screenId MaZUn5xHXZ)
---

# MoMorph design ground truth — Sun* Kudos Live Board

Source: MoMorph MCP node styles (authoritative), root node `2940:13431`, revision `904fca587cc5bbddf4075c207e680277`. All values extracted, not inferred, unless marked.

## 0. Frame canvas

| Property | Design value |
|---|---|
| Frame width | **1440px** (height 5862px) |
| Page background | **#00101A** (`rgba(0,16,26,1)`, token `--Details-Background`) |
| Content gutter | 144px left/right (content width 1152px) |
| Base font | Montserrat, weight 700 nearly everywhere |

## 1. CRITICAL — Kudos card anatomy (design vs implementation)

Design cards are **LIGHT CREAM cards on a dark page** — the implementation renders **dark cards**. This is the single largest deviation.

### 1a. Highlight card (`B.3_KUDO - Highlight`, node 2940:13465, 528px wide)

| Element | Design value | Implementation (`kudos-card.tsx`) | Verdict |
|---|---|---|---|
| Card background | **#FFF8E1** (cream, token `--Details-PrimaryButton-Hover`) | `bg-[#101317]` (near-black) | **DEVIATES (major)** |
| Card border | **4px solid #FFEA9E**, radius **16px** | `border` 1px `#2E3940`, `rounded-2xl` (16px) | **DEVIATES** (color+width; radius matches) |
| Card padding / gap | 24px 24px 16px 24px, gap 16px | `p-6` (24px), gap 16px | Matches (bottom padding off by 8px) |
| Sender/recipient name | Montserrat 700 16/24, ls 0.15px, **#00101A** (dark on cream) | `text-white` 14px | **DEVIATES** (color inverted, size) |
| Unit code "CECV10" | Montserrat 700 14/20, **#999999** | `text-white/60` 12px | **DEVIATES** (color) |
| Avatar | 64px circle, **1.869px solid #FFF** border | `Avatar size={36}` | **DEVIATES** (size, border) |
| Internal dividers (x2) | 1px **#FFEA9E** (above content, above action row) | `border-t border-[#2E3940]` (action row only) | **DEVIATES** (color; missing top divider) |
| Timestamp "10:00 - 10/30/2025" | Montserrat 700 16/24, ls 0.5px, **#999999** | `text-white/50` 12px | **DEVIATES** (color) |
| Title "IDOL GIỚI TRẺ" | Montserrat 700 16/24, ls 0.5px, **#00101A**, centered | `text-[#FFEA9E]` 14px left | **DEVIATES** |
| Yellow inner content box | bg **rgba(255,234,158,0.40)** (token `--Details-ButtonSecondary-Hover`), border **1px solid #FFEA9E**, radius **12px**, padding 16px 24px | No box at all — plain paragraph | **MISSING ELEMENT** |
| Content text | Montserrat 700 **20/32**, justified, **#00101A**, 3-line clamp (highlight) / 5-line (feed) | 14px `text-white/90`, clamp 3/5 | **DEVIATES** (color, size, weight); clamp logic matches |
| Hashtag text | Montserrat 700 16/24, ls 0.5px, **#D4271D (red)**, plain inline text one line ("#Dedicated #Inspring…") | Pills `bg-white/10 text-[#FFEA9E]` 12px | **DEVIATES** (red text vs yellow pills; design has no pill chips) |
| Heart count "1.000" | Montserrat 700 **24/32**, **#00101A** | 14px, `text-white/70` / `text-[#FFEA9E]` when liked | **DEVIATES** |
| Heart icon | 32×32 instance; per specs CSV: **gray when inactive, red when active** (fill color not exposed in node styles — icon is a component leaf) | 18×18, yellow `#FFEA9E` when liked, white/70 outline otherwise | **DEVIATES** (liked color should be red, size) |
| "Copy Link" / "Xem chi tiết" | Text buttons: Montserrat 700 16/24 ls 0.15px, **#00101A**, padding 16px, radius 4px, trailing **24px icon** (link icon / arrow icon) | 14px white/70 text, CopyLink has own styling, no trailing icons at these specs | **DEVIATES** (color, missing icon treatment) |
| Sender→recipient arrow | 32px-wide icon column between the two Infor blocks | `SentArrowIcon` present | Present (verify size) |
| "Danh hiệu" badge (Rising Hero) | Pill 109×19, radius 48px, border 0.5px #FFEA9E, image bg + `rgba(9,36,50,0.5)` overlay, text **#FFF** Montserrat 700 11.4px with text-shadow | Not rendered on cards (only `post.title` text exists) | **MISSING ELEMENT** |
| Star count ("số hoa thị") | dot separator (4px, #999 at 40%) + badge row under name | `⭐ {stars}` emoji | Partial (visual treatment differs) |

### 1b. All-Kudos feed card (`C.3_KUDO Post`, node 3127:21871, 680px wide)

Same anatomy as 1a except:
| Element | Design value |
|---|---|
| Background | **#FFF8E1**, radius **24px**, padding **40px 40px 16px 40px**, **no border** |
| Title row | "IDOL GIỚI TRẺ" (#00101A, centered) + **32px pencil icon (MM_MEDIA_Pen) right-aligned** — it is a clickable tag/filter (spec D.4) |
| Photo thumbnails | Row of **5 images, 88×88**: outer white (#FFF) frame radius **18px** + border 1px #998C5F; inner image radius 4px + border 1px #FFEA9E; gap 16px |
| Content clamp | 5 lines (vs 3 on highlight) — implementation matches this rule |
| Action row | Hearts **left**, only **Copy Link** right (no "Xem chi tiết" on feed cards) — implementation matches this rule |

## 2. Per-section colors & typography

### Hero (`A_KV Kudos` + `Button chuc nang`)
| Element | Design value |
|---|---|
| "Hệ thống ghi nhận và cảm ơn" | Montserrat 700 36/44, **#FFEA9E** |
| "KUDOS" logotype | SVN-Gotham 400 ~140px, **#DBD1C1**, ls −13%, + 120×94 star logo group |
| Keyvisual | Full-width 1440×512 image + gradient cover `linear-gradient(25deg, #00101A 14.74%, rgba(0,19,32,0) 47.8%)` |
| Compose pill "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?" | 738×72, radius **68px**, border 1px **#998C5F**, bg **rgba(255,234,158,0.10)**, padding 24px 16px; leading **24px pen icon**; text Montserrat 700 16/24 **#FFF** |
| Search pill "Tìm kiếm profile Sunner" | 381×72, same pill styling; leading 24px magnifier icon; white 16/24 text |

### HIGHLIGHT KUDOS header (`B.1_header`)
| Element | Design value |
|---|---|
| Subtitle "Sun* Annual Awards 2025" | Montserrat 700 24/32, **#FFFFFF** |
| Divider under subtitle | 1px **#2E3940** full content width |
| "HIGHLIGHT KUDOS" | Montserrat 700 **57/64**, ls −0.25px, **#FFEA9E** |
| Filter buttons "Hashtag" / "Phòng ban" | radius **4px**, border 1px #998C5F, bg rgba(255,234,158,0.10), padding 16px; white 16/24 text + 24px chevron-down icon; right-aligned on the heading row |
| Carousel | 3 visible cards gap 24px; side cards masked by gradients `linear-gradient(90deg/270deg, #00101A 50%, transparent 100%)` (400px wide fade panels) |
| Pagination (`B.5_slide`) | prev/next 48×48 transparent buttons radius 4px with 28px chevron icons; counter "2/5" Montserrat 700 **28/36 #999**; centered, gap 32px |

### SPOTLIGHT BOARD (`Frame 552`)
| Element | Design value |
|---|---|
| Section header | Identical pattern: white 24/32 subtitle + #2E3940 divider + "SPOTLIGHT BOARD" 57/64 #FFEA9E |
| Board frame (`B.7_Spotlight`) | 1157×548, radius **47.14px**, border 1px **#998C5F**; photo-collage bg with `rgba(0,0,0,0.70)` overlay |
| "388 KUDOS" | Montserrat 700 36/44, **#FFFFFF** (top-left inside board) |
| Mini search pill (`B.7.3`) | 219×39, radius 46.4px, border 0.682px #998C5F, bg rgba(255,234,158,0.10) (top-right inside board) |
| Pan/zoom control (`B.7.2`) | 30×30 icon button |
| Name nodes | ~6.66px Montserrat 700 white, centered — dozens of names over member photos |
| Bottom ticker | **6 stacked text nodes** "08:30PM Nguyễn Bá Chức đã nhận được một Kudos mới", 14/20 Montserrat 700 **#FFF**, opacities **1, 1, 0.7, 0.5, 0.3, 0.1** (fading upward stack) |

### ALL KUDOS section (`C_All kudos`)
| Element | Design value |
|---|---|
| Header | Same pattern: white 24/32 + #2E3940 divider + "ALL KUDOS" 57/64 #FFEA9E |
| Layout | Feed column **680px** + sidebar **422px**, gap 80px, inside 144px gutters |
| Feed cards | See 1b |

### Right sidebar (`D_Thống menu phải`, 422px)
| Element | Design value |
|---|---|
| Stats box (`D.1`) | bg **#00070C** (token `--Details-Container-2`), border 1px **#998C5F**, radius **17px**, padding 24px |
| Stat rows (5) | Label right-aligned Montserrat 700 **22/28 #FFF** ("Số Kudos bạn nhận được:") + value Montserrat 700 **32/40 #FFEA9E** ("25"); "Số tim" row also has a **x2 multiplier badge** (34×40 image + "x2" white 17.5px with 1.04px black text-stroke) |
| Divider inside box | 1px **#2E3940** (between tim row and secret-box rows) |
| "Mở Secret Box" button | bg **#FFEA9E**, radius **8px**, padding 16px, 60px tall full-width; text Montserrat 700 **22/28 #00101A** + 24px gift icon |
| "10 SUNNER NHẬN QUÀ MỚI NHẤT" box (`D.3`) | Same box style (#00070C / #998C5F / 17px); title Montserrat 700 22/28 **#FFEA9E**, centered, 2 lines |
| Recipient rows (5 visible) | avatar 64px circle (1.869px #FFF border) + name Montserrat 700 **22/28 #FFEA9E** + "Nhận được 1 áo phông SAA" Montserrat 700 16/24 **#FFF** right-aligned; row gap 16px |
| Scrollbar hint | 2px × 245px bar, **#999**, radius 8px, right edge |

### Header / Footer
| Element | Design value |
|---|---|
| Header bar | 1440×80, bg **rgba(16,20,23,0.80)** (#101417 @ 80%), padding 12px 144px, space-between |
| Header left | 52×48 logo + 3 nav text buttons (white Montserrat 700 16/24, e.g. "About SAA 2025"); **active tab: border-bottom 1px #FFEA9E** |
| Header right | Language dropdown (white text + chevron), bell icon 40×40 with **8px red dot #D4271D**, bordered icon button 40×40 (border 1px #998C5F, radius 4px) |
| Footer (`Header cuối`) | border-top 1px **#2E3940**, padding 40px 90px; logo 69×64 + 4 nav buttons (one highlighted bg rgba(255,234,158,0.10)); "Bản quyền thuộc về Sun* © 2025" — **Montserrat Alternates** 700 16/24 #FFF |

## 3. Element inventory (presence checklist for the implementation)

| Design element | Node | In implementation? |
|---|---|---|
| Hero/Rising/Legend "danh hiệu" badge pill on person rows | `3106:17694` ("Rising Hero" seen; component set `3007:17505` has variants) | **Missing** (cards show no badge pill) |
| Pencil icon in card title row (feed cards, 32px, right of "IDOL GIỚI TRẺ") | `I3127:21871;2234:33040` | Verify — `kudos-card.tsx` renders title text only → **Missing** |
| Pen icon in hero compose pill (24px, leading) | `I2940:13449;186:2759` | Present in compose trigger? verify `compose/` |
| Photo thumbnail row (5 × 88px, white frame radius 18px) | `I3127:21871;256:5176` | `KudosImageGallery` exists — verify sizing/borders |
| Carousel pagination arrows + "2/5" counter | `2940:13471` | Present (`highlight-kudos-carousel`) — check 48px buttons / 28/36 #999 counter |
| Carousel edge fade gradients (#00101A 50%→transparent) | `2940:13467/13469` | Verify |
| Spotlight ticker (6 fading lines, opacities 1→0.1) | `2940:14230`, `3004:15995-15999` | Verify (`spotlight-board`) |
| Spotlight "388 KUDOS" + mini search pill + pan/zoom button | `3007:17482`, `2940:14833`, `3007:17479` | Verify |
| Sidebar "x2" heart multiplier badge | `3241:14931` | Verify (`kudos-stats-box`) |
| Sidebar scrollbar hint bar | `2940:13521` | Verify |
| Star-count dot separator + hover tooltip logic (10/20/50 kudos thresholds) | spec B.3.2 | Emoji substitute only |
| Sender→recipient arrow icon (32px column) | `I2940:13465;335:9444` | Present |
| Notification bell red dot #D4271D | header | Out of /kudos scope (global header) |

## 4. Design token table (from Figma variables seen in styles)

| Token | Value |
|---|---|
| `--Details-Background` | #00101A |
| `--Details-Container-2` | #00070C |
| `--Details-Text-Primary-1` | #FFEA9E |
| `--Details-Text-Secondary-1` | #FFF |
| `--Details-Text-Secondary-2` | #999 |
| `--Details-Border` | #998C5F |
| `--Details-Divider` | #2E3940 |
| `--Details-PrimaryButton-Hover` (card bg) | #FFF8E1 |
| `--Details-SecondaryButton-Normal` | rgba(255,234,158,0.10) |
| `--Details-ButtonSecondary-Hover` (content box) | rgba(255,234,158,0.40) |
| Hashtag / alert red | #D4271D |

## 5. Summary of key deviations (impl → design)

1. **Card surface inverted**: impl `#101317` dark card → design **#FFF8E1 cream** card with dark `#00101A` text throughout.
2. **Card border**: impl 1px `#2E3940` → design **4px #FFEA9E** (highlight) / **none, radius 24px** (feed).
3. **Missing yellow inner content box** (rgba(255,234,158,0.40), 1px #FFEA9E, radius 12px) around the message text.
4. **Hashtags**: design is plain **red #D4271D** running text, not yellow pills.
5. **Hearts**: count should be large (24/32) dark text; heart icon gray→**red** on like (not yellow), 32px.
6. **Missing**: danh hiệu badge pills (New/Rising/Legend Hero), pencil icon on feed-card title row, #FFEA9E internal dividers, trailing icons on Copy Link/Xem chi tiết.
7. Page bg token: impl uses `#00101A` in places — matches; but card-level `#101317`/`#2E3940` only legitimately appear in the **header bar** (rgba(16,20,23,0.8)) and **dividers** respectively.

Heart icon exact fill is the only value not extractable from node styles (component leaf); specs CSV states gray inactive / red active — #D4271D is the design's red (EXTRACTED for hashtag/dot, INFERRED 0.8 for heart fill).

**Status:** DONE
**Summary:** Full visual ground truth extracted from MoMorph for screen MaZUn5xHXZ (1440px canvas, bg #00101A). Cards are cream #FFF8E1 with dark text, 4px #FFEA9E border (highlight) — the implementation's dark #101317/#2E3940/white-text cards deviate on nearly every card-level value; section headings, pill buttons, sidebar boxes, ticker, and footer specs tabulated with exact hex/typography.
**Concerns/Blockers:** Heart icon fill not exposed in node styles (icon component leaf); specs CSV confirms gray-inactive/red-active — red assumed #D4271D.
