# Login screen — live MoMorph numeric layout contract

Source: MoMorph MCP, fileKey `9ypp4enmFmdK3YAFJLIu6C`, screenId `GzbNeVGJHz` (figma node `662:14387`, frame "Login", design_status=done, spec_status=done). Data pulled 2026-07-07 via `get_frame`, `get_frame_node_tree`, `download_specs`, `query_section`/`list_frame_styles` (numeric CSS). All numbers below are EXTRACTED, not guessed.

## Design coverage across viewports

`list_frames` on this fileKey returns exactly **one** frame for this screen: "Login" (`662:14387`, screen `GzbNeVGJHz`) at **1440×1024**. No 1280/768/375 variant of this same node tree exists.

A separate frame **"[iOS] Login"** (screen `8HGlvYGJWq`, node `6885:8963`, 375×812) exists in the same file, but it is a **different figma node / different screen**, not a responsive breakpoint of `662:14387`: different node IDs throughout, different footer padding (`16px 90px` vs desktop `40px 90px`), no header/section naming convention (`mms_A_Header`/`mms_B_Bìa`) shared with the web frame, different background/scrim treatment (multi-stop vertical gradient vs the web frame's horizontal scrim + separate bottom Cover). Treating it as "the 375px breakpoint" of the web Login page would be a guess, not a design match — it is not used below.

**Conclusion: 1280 / 768 / 375 are "not in design" for this screen.** Only 1440 is populated.

## Numeric contract table (viewport 1440 — the only one in design)

| viewport | frame w/h | left/right gutter | content max width | section height | padding top/bottom | gap | text block width | font role | bg layer |
|---|---|---|---|---|---|---|---|---|---|
| 1440 | 1440×1024 | **Header/Main: 144px** each side; **Footer: 90px** each side (two different gutters, both real in the source, see below) | 1152px (=1440−2×144), implied by padding only — **no explicit max-width cap node** in Figma | Header 80px; Main section (`mms_B_Bìa`) 845px; Footer ~91px (933→1024) | Header 12/12px; Main 96/96px; Footer 40/40px | Main→Frame487 gap 80px; KeyVisual→text gap 24px; text block→button gap 24px; button icon gap 8px | Hero subtitle text node 480px wide (`mms_B.2_content`, height 80) | see typography table below | Hero: `image 1` (662:14389) full-bleed 1441×1022 behind horizontal scrim `Rectangle 57` (662:14392, 1442×1024, `linear-gradient(90deg,#00101A 0%,#00101A 25.41%,transparent 100%)`, z-index 1) + separate bottom scrim `Cover` (662:14390, 1440×1093, positioned startY=138, `linear-gradient(0deg,#00101A 22.48%,transparent 51.74%)`), paint order: Keyvisual → Header → Rectangle57 → mms_B_Bìa (content) → Cover → Footer |
| 1280 | not in design | not in design | not in design | not in design | not in design | not in design | not in design | not in design | not in design |
| 768 | not in design | not in design | not in design | not in design | not in design | not in design | not in design | not in design | not in design |
| 375 | not in design (see "[iOS] Login" caveat above — a *different* screen, not a breakpoint of this one) | — | — | — | — | — | — | — | — |

### Node-level numbers (1440, all EXTRACTED)

- Root `662:14387` "Login": 1440×1024, bg `#00101A`.
- `mms_A_Header` (`662:14391`): flex row, `justify-content:space-between`, `align-items:center`, width 1440, height 80, **padding `12px 144px 12px 144px`**, bg `rgba(11,15,18,0.8)`.
  - Logo (`mms_A.1_Logo`): 52×56 box, image 52×48.
  - Language (`mms_A.2_Language`): 108×56.
- `mms_B_Bìa` (`662:14393`, main section): flex column, width 1440, height 845, **padding `96px 144px 96px 144px`**, gap 120px, position top=88 (i.e. starts 8px below the 80px header — Figma absolute coordinate, not a CSS-derived gap).
  - `Frame 487` (`662:14394`): 1152×653, gap 80px, `justify-content:center` (vertically centers the two children inside the 845px-tall section).
    - `mms_B.1_Key Visual` (`662:14395`): 1152×200, gap 24px.
      - `MM_MEDIA_Root Further Logo` image: 451×200, `aspect-ratio 115/51`.
    - `Frame 550` (`662:14755`): 496×164, **padding `0 0 0 16px`**, gap 24px.
      - `mms_B.2_content` text: 480×80, fontSize 20, lineHeight 40, fontWeight 700, letterSpacing 0.5px, fontFamily Montserrat, textAlign left. Content: "Bắt đầu hành trình của bạn cùng SAA 2025.\nĐăng nhập để khám phá!"
      - `mms_B.3_Login` → `Button-IC About` (`662:14426`): 305×60, **padding `16px 24px 16px 24px`**, gap 8px, bg `rgba(255,234,158,1)`, borderRadius 8px.
        - Text "LOGIN With Google ": fontSize 22, lineHeight 28, fontWeight 700, letterSpacing 0px, color `rgb(0,16,26)`.
        - `MM_MEDIA_Google` icon: 24×24.
- `mms_D_Footer` (`662:14447`): width 1440, **padding `40px 90px`**, `border-top: 1px solid #2E3940`, `align-items:center`, `justify-content:space-between`. Position top=933 → height ≈91.
  - Copyright text: 275×11 box, fontSize 16, lineHeight 24, fontWeight 700, letterSpacing 0%, fontFamily **Montserrat Alternates**, textAlign center.

## Single gutter / max-width verdict

The Login frame does **not** imply one single gutter value — Figma itself uses **two real, different gutters within the same 1440px frame**:

1. **Header + Main content gutter = 144px** each side (1440 − 2×144 = 1152 content width). This is the same 1152 used site-wide as a `ContentFrame` width option.
2. **Footer gutter = 90px** each side (deliberately narrower — the footer is a distinct, simpler shared component reused across the site).

This is **not a design bug** — it is intentional and already correctly implemented: `login-footer.tsx` does not use the shared `PageGutter`, it hardcodes `px-[90px] py-10` with a comment citing node `662:14447` and cross-referencing `site-footer.tsx`'s identical value. Do not "fix" this into `PageGutter` — that would introduce the actual mismatch.

For the **header and main content**, the current shared primitive matches exactly at the only in-design viewport:
- `PageGutter`'s `GUTTER_CLASS = "px-6 sm:px-10 lg:px-36"` → at `lg` (≥1024px, Tailwind default) `px-36` = 9rem = **144px** each side. This is an **exact match** to Figma's 144px header/main padding at 1440.
- `login/page.tsx`'s `<PageGutter as="main" className="... py-12 lg:py-24">` → `lg:py-24` = 6rem = **96px**, exact match to Figma's 96px vertical section padding.
- `login-header.tsx`'s `<PageGutter as="header" className="... py-3">` → `py-3` = 12px, exact match to Figma's 12px header vertical padding.

**No `ContentWidth`/`ContentFrame` (1120/1152/1224) is applied on the Login screen** — `page.tsx` uses bare `PageGutter`, never wraps content in `ContentFrame`. At exactly 1440px viewport this is invisible (144px padding both sides on a 1440 viewport algebraically gives 1152, matching the design's implied content width), but `px-36` is a **fixed pixel value with no upper viewport bound**: on any viewport wider than 1440 (1920, 2560, ultrawide) the content column keeps growing past 1152px indefinitely, since nothing caps it. This exact same "PageGutter without ContentFrame" pattern also appears on `awards-hero.tsx` and `prelaunch/page.tsx` — so it is a **systemic gap in the shared layout system**, not a login-only defect. Home and Kudos screens, by contrast, always pair `PageGutter` with an explicit `ContentFrame` width (1152/1224).

## Mismatch classification (section 5 of the layout rule)

| # | Finding | Classification | Severity |
|---|---|---|---|
| 1 | Login/awards-hero/prelaunch use `PageGutter` with no `ContentFrame` cap → content width unbounded above 1440px viewport | **wrong max-width** (missing viewport constraint) | Medium — only visible on viewports wider than the 1440 design canvas; not visible on the design's own reference viewport |
| 2 | `LoginHeroContent`'s outer wrapper `max-w-[600px]` has no corresponding Figma node of that width (measured widths in this subtree: 1152 / 496 / 480 / 451) | **wrong spacing/width token** (unsourced value) | Low — currently inert because both children (451px logo, 496px text/button block) are already narrower than 600px, so it doesn't visibly clip anything at 1440; still fails "populate every number from the live source" and should either be justified or removed (YAGNI) |
| 3 | `sm:` (tablet) and base (mobile) Tailwind values used throughout Login (`LoginHeroContent`'s `w-[240px]/w-[340px]`, `gap-10/gap-16`, `PageGutter`'s `px-6/sm:px-10`) have **no design source** — only the 1440 frame exists | **wrong viewport constraint** (unverifiable) | Info/flag only — cannot be "fixed" without either a tablet/mobile Figma frame or explicit product sign-off; do not treat current values as validated |
| 4 | Footer gutter (90px) differs from header/main gutter (144px) | **Not a mismatch** — confirmed correct, intentional, already correctly implemented outside `PageGutter` | N/A (documented so it isn't "corrected" into a bug) |

Everything else checked against the design (header padding/gap, main section padding/gap, hero subtitle typography incl. 480px wrap width, 20px/40px/0.5px/700, Google button 305×60/16px×24px padding/8px gap/22px/28px/700/`#FFEA9E`/`#00101A`/8px radius, footer copyright 16px/24px/700/Montserrat Alternates) **matches the live design exactly** in the current implementation (`app/login/page.tsx`, `login-header.tsx`, `login-hero-content.tsx`, `login-button.tsx`, `login-footer.tsx`).

## Unresolved questions

1. Should the site define an explicit upper-bound `ContentFrame` for Login/awards-hero/prelaunch (matching 1152, per header/main gutter math), or is unbounded growth above 1440px an accepted trade-off? Needs a design/product decision, not inferable from MoMorph (only one frame exists).
2. Is `LoginHeroContent`'s `max-w-[600px]` intentional headroom for a longer future subtitle, or leftover/arbitrary? No Figma node supports either answer.
3. No MoMorph frame exists for Login at 1280/768/375 — confirm with the design team whether tablet/mobile Login frames are forthcoming before treating current `sm:`/base classes as anything more than an unverified reconstruction.
