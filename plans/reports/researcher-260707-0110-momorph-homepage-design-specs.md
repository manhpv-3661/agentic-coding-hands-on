# Research: MoMorph "Homepage SAA" ground truth (fileKey `9ypp4enmFmdK3YAFJLIu6C`, screenId `i87tDx10uM`)

## Access blocker (read first)

- No `mcp__momorph__*` tool (query_by_type/query_component/get_node/list_design_items/download_specs/get_frame_image) and no `ToolSearch` were present in this agent's tool set — could not load them live.
- Public URL `https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM` → **HTTP 403 Forbidden** via WebFetch (auth-gated, no session available to this agent).
- Repo has no cached MoMorph CSV/specs export (`git log --diff-filter=A -- '*.csv'` and `find *.csv` both empty for this screen; `plans/260706-0900-homepage-saa/data/` only has an asset-path manifest + node-name map, no style values).
- **What I used instead**: `app/page.tsx` and `app/components/home/*.tsx` carry inline code comments citing exact Figma node IDs (`mm:2167:xxxx`) and, in three places, verbatim quotes from `get_node()` calls made during the original Track A build (phase-05, sealed 9.6/10 per `plans/260706-0858-homepage-saa/evidence/inspection-verdict.json`). Every value below is traceable to a specific Tailwind class / inline style in the shipped component, which is itself annotated with the source node ID. This is **secondhand-but-attributed** ground truth, not a fresh live query — flagged `EXTRACTED (secondhand)` throughout. Nothing here is guessed.

## 0. Canvas

- Figma artboard: **1512px** wide (stated explicitly in `hero-section.tsx` docblock, derived from `max-w-[1224px]` = 1512 − 2×144).
- Content frame widths by section: hero/awards `1224px`, Root-Further block `1152px`, Kudos block `1120px`.

## 1. Per-section styles

| Section | Node ID | Background | Text/accent colors | Border | Font (size/weight/leading) | Radius | Key spacing |
|---|---|---|---|---|---|---|---|
| Page root | `2167:9026` | `#00101A` solid | — | — | — | — | vertical rhythm between Hero/Root-Further/Awards/Kudos: `gap-12`(48px)/`py-12` mobile → `gap-16`/`py-16` tablet → **`gap-[120px]`/`py-24`(96px)** desktop — verbatim from `get_node("2167:9030")` |
| Keyvisual backdrop | `2167:9027`/`2167:9029` | photo + `linear-gradient(12deg, #00101A 23.7%, rgba(0,18,29,.46) 38.34%, rgba(0,19,32,0) 48.92%)` | — | — | — | — | height 560px (mobile)/760px (sm)/1392px (lg) |
| Header (A1) | `2167:9091` | `rgba(16,20,23,0.8)` (semi-transparent, sits over backdrop) | selected nav: `#FFEA9E` w/ underline; default nav: white | nav underline `#FFEA9E` | nav link `text-sm`(14px)/`leading-5`(20px)/bold/`tracking-[0.1px]` | nav link/menu buttons `rounded-[4px]` | `min-h-20`(80px), `px-6`→`px-36`(144px desktop), `py-3`(12px) |
| Hero + countdown (B1-B3) | `2167:9030` | (backdrop only, transparent) | countdown digits white on card; label white; event value `#FFEA9E` | digit card `border-[0.5px] #FFEA9E` | digits `text-[49.152px]` (Orbitron); unit label `text-2xl`(24px)/`leading-8`(32px)/bold; event label `text-base`(16px)/`leading-6`(24px)/bold/`tracking-[0.15px]`; event value `text-2xl`/bold/`#FFEA9E` | digit card `rounded-lg` | digit card `81.92×51.2px`; event-info row `gap-2` mobile/`gap-[60px]` desktop |
| Hero CTA buttons | `2167:9062-64` | primary `#FFEA9E`; secondary `#FFEA9E1A` (10% gold) | primary text `#00101A`; secondary text white | secondary `border #998C5F` | `text-[22px]`/`leading-7`(28px)/bold | `rounded-lg` | `px-6 py-4`, `gap-2` |
| Root-Further block (B4) | `3204:10152` | none (inherits page `#00101A`) | body/quote white (`--Details-Text-Secondary-1` = `#FFF`) | — | body `text-[24px]`/`leading-[32px]`/bold/`tracking-[0px]`, justified; pull-quote `text-[20px]`/`leading-[32px]`/bold, centered | block `rounded-[8px]` | `px-[104px] py-[120px]`, `gap-8`(32px) |
| Awards grid header (C1) | `2167:9068-73` | none | caption white; heading `#FFEA9E` | divider `#2E3940` 1px | caption `text-[24px]`/`leading-[32px]`/bold; heading "Hệ thống giải thưởng" `text-[57px]`/`leading-[64px]`/bold/`tracking-[-0.25px]` | — | content `gap-20`(80px) |
| Award card (C2, ×6) | `214:1032` (instances `2167:9075/76/77/79/80/81`) | thumbnail `Award-BG.png` (shared photo, same for all 6 — design reuses one image, not a bug) | title `#FFEA9E`; description white | thumbnail `border-[0.955px] #FFEA9E` | title `text-[24px]`/`leading-[32px]`/normal; description `text-[16px]`/`leading-[24px]`/normal/`tracking-[0.5px]`; "Chi tiết" CTA `text-[16px]`/`leading-[24px]`/medium/`tracking-[0.15px]` | thumbnail `rounded-3xl`(24px) | glow `boxShadow: 0 4px 4px rgba(0,0,0,.25), 0 0 6px #FAE287` |
| Sun* Kudos (D1-D2) | `3390:10349` | `Kudos-Background.png` inside block | label/description white; heading `#FFEA9E`; CTA text `#00101A` on `#FFEA9E` bg | — | label `text-2xl`/`leading-8`/bold; heading `text-[57px]`/`leading-[64px]`/bold/`tracking-[-0.25px]`; description `text-base`/`leading-6`/bold/`tracking-[0.5px]`; CTA `text-base`/`leading-6`/bold/`tracking-[0.15px]` | image block `rounded-2xl`(16px); CTA `rounded-[4px]` | CTA hover shadow `0 8px 24px rgba(255,234,158,.35)` |
| Floating widget (6) | `5022:15169` | pill `#FFEA9E`; quick-actions panel `#101317` | pill text `#00101A` | panel `border #2E3940` | pill label `text-2xl`/`leading-8`/bold | pill `rounded-full`; panel `rounded-lg` | pill `w-[106px] h-16`(64px); glow `0 4px 4px rgba(0,0,0,.25), 0 0 6px #FAE287` |
| Footer (7) | `5001:14800` | none (page `#00101A`) | nav links white (`bg-[#FFEA9E]/10` when highlighted); copyright white | `border-t #2E3940` | nav `text-base`/`leading-6`/bold/`tracking-[0.15px]`; copyright same, font **Montserrat Alternates** | nav link `rounded-[4px]` | `px-[90px] py-10`(40px), `gap-6`(24px) |
| Dropdowns (bell/account/widget) | — | panel `#101317` | text white | `border #2E3940` | `text-sm` | `rounded-lg` | `p-4`, `w-48`–`w-64` |

Shared type family: **Montserrat** (body/UI everywhere), **Montserrat Alternates** (footer copyright only), **Orbitron** (countdown digits only).

## 2. Element inventory (per section, for missing-element detection)

| Section | Elements |
|---|---|
| Header | Logo (image, link → `/` + scroll-top) · 3 nav links: "About SAA 2025" (selected state), "Awards Information" → `/awards`, "Sun* Kudos" → `/kudos` · Notification bell button (40×40) + empty-state panel · Language selector (VN/EN flag) · Account menu button (40×40) + dropdown (Profile stub, Sign out) |
| Hero | Root-Further-Logo image · Countdown: 3 digit-pair modules (DAYS/HOURS/MINUTES) each 2 zero-padded digits + unit label · "Coming soon" label (conditional) · Event info: date value, location value, livestream note · 2 CTA buttons ("ABOUT AWARDS" primary, "ABOUT KUDOS" secondary) each with IconUp chevron |
| Root-Further block | Root-Text image · Further-Text image · 2 body paragraphs · 1 pull-quote ("A tree with deep roots fears no storm") |
| Awards grid | Caption "Sun* annual awards 2025" · 1px divider · Heading "Hệ thống giải thưởng" · 6× award card, each: thumbnail (shared `Award-BG.png`) + title-graphic overlay (`Award-Name-*.png`) + IconUp chevron + title text + 2-line-clamp description + "Chi tiết" link |
| Sun* Kudos | Kudos-Background image · label "Phong trào ghi nhận" · heading "Sun* Kudos" · description paragraph · Kudos-Logo decorative image (top-right, `left-[60%] w-[32.5%]`) · "Chi tiết" CTA button + IconUp |
| Floating widget | Pill button (Kudos-Logo-Small icon + "Coming soon" text) · click-triggered quick-actions stub panel |
| Footer | Logo image (link → `/` + scroll-top) · 4 nav links: "About SAA 2025", "Awards Information", "Sun* Kudos", "Tiêu chuẩn chung" (mirrors header states) · copyright text "Bản quyền thuộc về Sun* © 2025" |

Asset manifest (all resolved, 1 failed download): see `plans/260706-0900-homepage-saa/data/assets.md` — `Icon-Pen.svg` (node `I5022:15169;214:3839;186:1763`) returned `403 Forbidden` at original download time; verify it isn't silently missing from the current widget quick-actions panel.

## 3. Confidence

All values above are `EXTRACTED (secondhand)`: real numbers, but read from shipped component code + comments rather than a fresh MCP query this session. Two items are genuinely `INFERRED`: (a) any node not mentioned in a code comment (e.g., exact px values inside `%`-positioned Kudos overlay) is only approximated by the Tailwind arbitrary-percentage values already in `sun-kudos-section.tsx`; (b) no frame screenshot was retrievable, so this report has no pixel-level visual to diff against — only structured values.

## Unresolved / needs live MCP access to close

1. No `get_frame_image` screenshot obtained — recommend a session with working MoMorph MCP tools re-run `get_frame_image(i87tDx10uM)` before a pixel-diff pass.
2. Countdown card corner radius stated as `rounded-lg` (Tailwind ~8px) from code, not reconfirmed against `get_node` in this session.
3. `Icon-Pen.svg` 403 at asset-download time — confirm current widget panel doesn't have a silently-missing icon.
4. Kudos section's percentage-based overlay positions (`left-[5.71%]`, `top-[43%]`) were not cross-checked against absolute Figma coordinates this session.

**Status:** DONE_WITH_CONCERNS
**Summary:** MoMorph MCP tools and the public screen URL were both unreachable this session (no `mcp__momorph__*`/`ToolSearch` in toolset; URL → 403). Compiled equivalent ground truth (colors, typography, radii, spacing, canvas width 1512px, element inventory) from Figma-node-annotated code comments in the already-shipped `app/page.tsx` + `app/components/home/*` (built pixel-perfect from the same screen, sealed at 9.6/10). Data is real and traceable to specific node IDs but is secondhand, not a live re-query, and has no frame screenshot.
**Concerns/Blockers:** No live MCP access → no fresh visual (image) ground truth was possible; the 4 unresolved items above should be closed by a session with working MoMorph MCP tools before relying on this for a strict pixel-diff.
