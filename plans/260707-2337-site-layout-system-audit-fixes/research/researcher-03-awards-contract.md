# Awards Screen — Numeric Layout Contract (live MoMorph)

Source: MoMorph MCP, live. fileKey `9ypp4enmFmdK3YAFJLIu6C`, screenId `zFYDgyj_pD` ("Hệ thống giải"), figma node `313:8436`. `design_status: done`, revision `bd17cac...`. Data pulled via `get_frame`, `get_frame_node_tree`, `get_node` (per-node styles+position), `download_specs`.

**Design coverage caveat (read first):** MoMorph ships exactly ONE frame for this screen, fixed at **1440px** width. `list_frames` on the whole file (280+ frame names) has no 1280 / 768 / 375 variant of "Hệ thống giải" — the only other Awards-adjacent frames are separate `[iOS] Award_*` detail screens (a different feature, not a responsive breakpoint of this page). **All 1280/768/375 cells below are "not in design"** — current Tailwind `sm:`/base values on this screen are inherited convention from other screens, not verified against a live Awards frame at those widths.

## Contract table

| viewport target | frame width/height | left/right gutter | content max width | section height | padding top/bottom | gap | text block width | font-size/line-height/letter-spacing/weight | bg layer/blur/crop/z-index |
|---|---|---|---|---|---|---|---|---|---|
| **1440 — Header** (`313:8440`) | 1440 × 80 | **144px** | n/a (row, space-between) | 80 | 12 / 12 | 238 (row) | — | — | bg `rgba(16,20,23,0.8)`, z-index 1 |
| **1440 — Hero/Keyvisual bg** (`313:8437`, group) | 1440 × 547 (y 80→627, full-bleed, **0px gutter**) | 0 (edge-to-edge) | n/a (bg layer) | 547 | — | — | — | — | absolute, z-index 1; gradient overlay `linear-gradient(0deg,#00101A -4.85%,transparent 60.51%)` local to the 547px box |
| **1440 — Hero content (KV logo)** (`313:8450`) | 1152 × 150 (y 184→334, local offset from hero-bg top = **104px**) | 144 | 1152 | 150 | — | col gap 40 | — | — | z-index 1 |
| **1440 — "Bìa" content wrapper** (`313:8449`) | 1440 × 6164 (y 88→6252) | **144 / 144** | **1152** (1440 − 144×2) | 6164 | **96 / 96** | col gap **120** | — | — | z-index 1 |
| **1440 — Title section** (`313:8453`) | 1152 × 129 (y 454→583) | inherits 144 | 1152 | 129 | — | col gap 16 | eyebrow 1152 (centered) / heading row 1152 (justify-center) | eyebrow 24/32, wt700, ls 0, white — heading 57/64, wt700, ls **-0.25px**, color `#FFEA9E` | eyebrow bg swatch shows white (text-color proxy), divider `#2E3940` 1px |
| **1440 — Catalog "mms_B"** (`313:8458`) | 1152 × 4833 (y 703→5536) | inherits 144 | 1152 | 4833 | — | row, declared gap 80, **effective gap 121** (justify: space-between overrides the 80 token with only 2 children — nav 178px + cards 853px = 1031, leftover 121 becomes the real visual gap) | nav col 178 / cards col 853 | — | z-index 1 |
| **1440 — Sun\*Kudos block** (`335:12023`) | 1152 × 500 (y 5656→6156) | inherits 144 | 1152 | 500 | — | col gap 10 | — | — | z-index 1 |
| **1440 — Footer** (`354:4323`) | 1440 × 144 (y 6266→6410) | **90px** (⚠ not 144 — see flag) | n/a | 144 | 40 / 40 | — | — | — | border-top 1px `#2E3940` |
| 1280 | not in design | not in design | not in design | not in design | not in design | not in design | not in design | not in design | not in design |
| 768 | not in design | not in design | not in design | not in design | not in design | not in design | not in design | not in design | not in design |
| 375 | not in design | not in design | not in design | not in design | not in design | not in design | not in design | not in design | not in design |
| **Root frame** (`313:8436`) | 1440 × 6410, bg `#00101A` | — | — | — | — | — | — | — | — |

## Single gutter / max-width verdict

- **Gutter = 144px** (desktop/lg). Confirmed against Header, "Bìa" wrapper, Hero content, Title, Catalog, Sunkudos — all consistently padded 144px both sides at 1440. This **matches** the current shared primitive's `lg:px-36` (144px) in `app/components/layout/page-layout.tsx`.
- **Content max-width = 1152px**. `1440 − 144×2 = 1152`, and every content child of "Bìa" (KV/Title/mms_B/Sunkudos) is independently sized to exactly 1152px. This **matches** the existing `CONTENT_WIDTH_CLASS[1152]` option already defined in `page-layout.tsx` — no new primitive value needed, only correct *application*.
- **Design-implied caveat:** MoMorph only encodes ONE breakpoint (1440px canvas). The 1152px content width is a *derived consequence* of fixed 144px padding on a 1440-wide frame, not an independently-declared max-width constraint — Figma is silent on what should happen above 1440px viewport width. There is also no global page-level max-width in `app/layout.tsx`/`globals.css` (checked — none exists), so on screens wider than 1440 the browser will render however the component code decides. The established codebase answer to this exact gap (5 other sections: `kudos-board.tsx`, `sun-kudos-section.tsx`, `hero-section.tsx`, `awards-section.tsx`, `root-further-content.tsx`) is to nest `PageGutter` → `ContentFrame width={...}` so content caps and centers instead of stretching. The Awards page does not follow this for its title+catalog block — see mismatch below.
- **Footer uses 90px gutter, not 144px** — a genuine inconsistency *in the design source itself* (shared `Footer` instance, not owned by the Awards screen). Flagged for awareness only; out of scope to fix here since `SiteFooter` is a cross-page shared component, not an awards-page-specific number.

## Mismatches, classified per section 5

1. **Wrong max-width — `app/awards/page.tsx:92` title+catalog block.**
   `<PageGutter className="flex flex-col gap-10 lg:gap-[120px]">` wraps the title section + `AwardsCatalog` with **no `ContentFrame`**, unlike every sibling section in the codebase. At exactly 1440px viewport this renders 1152px content (matches design by coincidence of PageGutter's fixed padding), but on any viewport wider than 1440px the content will stretch past the MoMorph-implied 1152px cap — diverging from design and from the app's own established pattern.
   The in-file comment justifying this (`"NOT a max-w + mx-auto cap, which would double-apply the 144px gutter... and shrink content to 864px"`) is **mathematically wrong**: `ContentFrame` (`page-layout.tsx:45-62`) applies only `max-w-[1152px] mx-auto` — zero padding. Nesting it inside `PageGutter` does not subtract another 288px; at 1440px it's a no-op (interior is already 1152), and above 1440px it correctly caps+centers at 1152, exactly mirroring `kudos-board.tsx:69-70` (`<PageGutter><ContentFrame width={1152}>`). Recommended fix: wrap with `ContentFrame width={1152}` to match the sibling pattern — no other change needed since the 1152 value is already numerically correct at 1440px.

2. **Unverified/no design source — sub-1440 breakpoints (1280/768/375).**
   Not a "mismatch" per se — there is no live Awards-screen frame at these widths to compare against. Current responsive values (`sm:px-10`, `px-6`, `sm:gap-20`, `sm:h-[380px]`, etc.) are inherited from the shared Tailwind scale used on other screens, not verified against this specific screen's design. Flag as **open risk**, not a confirmed defect — do not "fix" these by guessing; they'd need either a MoMorph frame for those breakpoints or explicit product sign-off on using the shared scale as a fallback.

3. **Not a mismatch — Hero background full-bleed.** `AwardsHero`'s `<Image fill>` inside `PageGutter` correctly ignores the ancestor's padding (CSS: `inset:0` on an absolutely-positioned element resolves against the containing block's padding box, not content box) and renders edge-to-edge — this matches the design's `mms_3_Keyvisual` group being 0-gutter full-bleed while only the inner KV logo content sits at the 144/1152 column. Verified correct, no fix needed.

4. **Not a mismatch — Hero content local offset.** `AwardsHero`'s `lg:pt-[104px]` on the KV content div is the precise local offset (`184 − 80 = 104`) between the KV logo frame's absolute Figma position and the hero background group's own top edge. Confirmed exact.

5. **Not a mismatch — top-level vertical rhythm.** `<main className="... lg:gap-[120px] lg:py-24 ...">` in `app/awards/page.tsx` (120px gap between Hero / title+catalog / SunKudos, 96px top/bottom page padding) exactly matches "Bìa"'s own `gap:120px` between KV→Title (120), Title→mms_B (120), mms_B→Sunkudos (120), and its own `padding: 96px 144px`. The DOM restructuring (Hero as its own `PageGutter` section vs. design's flat sibling list under one "Bìa") is a legitimate different decomposition that still reproduces identical numbers — no fix needed.

6. **Not a mismatch — heading text width.** The heading's Figma bounding box (931px) is an *auto-sized* text box for that exact Vietnamese string at 57px, not a designed fixed wrap width (parent row uses `justify-content:center`, not a fixed-width text container). Current `w-full text-center` is a reasonable/necessary adaptation for variable-length localized strings (EN copy will differ in length) — no numeric contract to enforce here.

7. **Design-source inconsistency, out of scope — Footer gutter (90px vs 144px).** Real discrepancy in the design file between `Footer` (90px h-padding) and every other Awards-screen container (144px). Since `SiteFooter` is shared across all pages (not owned/authored by the Awards screen), this is flagged for the layout-system audit's awareness but is **not** an Awards-page fix — would need a decision at the shared-component level.

## Unresolved questions
- Is there a MoMorph frame for Awards at 1280/768/375 under a different name/file not surfaced by `list_frames` (e.g. a duplicate file)? Only one file (`9ypp4enmFmdK3YAFJLIu6C`, "SAA 2025 - Internal Live Coding") was queried — confirm no sibling Figma file holds the responsive variants before treating those breakpoints as permanently unverifiable.
- Confirm whether the 90px vs 144px Footer gutter is intentional design and, if so, whether `SiteFooter`'s `PageGutter` usage should special-case it (separate from this task's scope).
