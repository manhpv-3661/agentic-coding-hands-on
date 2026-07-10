import Image from "next/image";
import { ContentFrame, PageGutter } from "../layout/page-layout";
import { Dictionary } from "@/lib/i18n/dictionary";

/**
 * Awards page hero keyvisual mini — MoMorph "Hệ thống giải" screen.
 * https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
 * Nodes: `313:8437` (mms_3_Keyvisual bg group) + `313:8439` (Cover gradient)
 * + `313:8450` (KV frame) → `2789:12915` (MM_MEDIA_Root Further Logo).
 *
 * FR-4: static, non-interactive banner — background image (cover,
 * center-crop) + "ROOT FURTHER" logo + subtitle "Sun* Annual Awards 2025".
 * Deliberately smaller than the homepage hero (`../home/hero-section.tsx`):
 * no countdown timer, CTA buttons, or event info — those are homepage-only
 * widgets out of scope here.
 *
 * The subtitle text has no dedicated node under the Keyvisual/KV subtree in
 * Figma (only the logo image lives there — verified via `get_frame_node_tree`
 * on `313:8450`); the visually adjacent "Sun* Annual Awards 2025" text
 * belongs to the separate Title section frame (`313:8453`, FR-5, rendered by
 * the page composition phase, not this component). FR-4 nonetheless
 * specifies this subtitle as part of the hero, so it is rendered here as
 * plain text per spec rather than invented as a fake node reference.
 *
 * Server-renderable (no `"use client"`) — purely presentational.
 */
export function AwardsHero({dictionary}: {dictionary: Dictionary}) {
  return (
    // mm:313:8437 + mm:313:8439
    <PageGutter as="section" className="relative h-[547px] overflow-hidden bg-[#00101A]">
      {/* mm:2167:5138 "image 20" — exact Figma fill transform (position
          `-0.163px -858.967px`, scale `101.245% 367.889%`) re-expressed as a
          sized/offset wrapper around the `Image`: the wrapper is sized to
          the scale percentages (of this 1440×547 band) and offset by the
          position, then the `Image` stretches to fill that wrapper exactly
          (`object-fill`, not `cover`) so the wrapper alone carries the crop
          — bare `object-cover` cannot express a non-uniform (x≠y) scale. */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute"
          style={{
            left: "-0.163px",
            top: "-858.967px",
            width: "101.245%",
            height: "367.889%",
          }}
        >
          <Image
            src="/homepage-saa/Keyvisual-BG.png"
            alt=""
            fill
            priority
            className="object-fill"
          />
        </div>
      </div>
      {/* mm:313:8439 (Cover) — ground truth's gradient stops (-4.23%/52.79%)
          are authored against the Cover rectangle's own 627px box, which
          spans the 80px header (`<header>` is `position: sticky`, so at rest
          it occupies its own 80px in normal flow rather than overlapping
          this section — confirmed via `site-header.tsx`) PLUS this 547px
          hero. Re-expressed against this section's own local height (547px,
          starting at absolute y=80 in the 627px box).

          `0deg` is CSS's "to top": the gradient line runs bottom→top, so 0%
          sits at the box's *bottom* edge and 100% at its *top* edge — i.e.
          `y = height * (1 - p / 100)`, the mirror image of `to bottom`/
          `180deg` (where `p / 100 = y / height` directly). Converting each
          global stop to a local pixel offset with that formula, then back
          to a local percentage against the 547px hero:
            y1 = 627 * (1 - (-0.0423)) = 653.53 (global) → 573.53 (local, −80)
              → p1 = 100 * (1 - 573.53 / 547)  ≈ -4.85%
            y2 = 627 * (1 - 0.5279)   = 296.03 (global) → 216.03 (local, −80)
              → p2 = 100 * (1 - 216.03 / 547) ≈ 60.51%
          (P8 fix — the prior `-19.47%/45.89%` pair was derived with
          `p / 100 = y / height`, the `to bottom` formula, applied to a
          `0deg`/`to top` gradient; that sign error left the fade noticeably
          less opaque at the hero-to-content seam than the ground truth.) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(0deg, #00101A -4.85%, rgba(0, 19, 32, 0.00) 60.51%)",
        }}
      />
      {/* mm:313:8450 ("KV" frame) — re-verified 2026-07-10 directly against
          live MoMorph data (`get_node`/`get_node_context`, screen zFYDgyj_pD),
          correcting a prior derivation error:
            - Header (313:8440): absolute Y 0→80.
            - mms_3_Keyvisual (313:8437, this section's own background/box):
              absolute Y 80→627, height 547 — i.e. THIS is the Figma
              equivalent of the React `<section className="h-[547px]">`
              below, flush against the header with zero gap.
            - KV (313:8450): absolute Y 184→334 (within `Bìa`, whose own
              padding-top(96) + absolute start(88) = 184, confirmed).
          Section-local offset = KV's absolute Y (184) − the section's own
          absolute start (80) = 104, i.e. `top-26` (Tailwind canonical for
          104px) — NOT `top-[184px]` as this comment previously claimed
          (that value was KV's raw Figma-absolute Y, used directly without
          subtracting the section's own 80px start — an off-by-header-height
          bug that shipped as "correct per spec" for a while).
          `inset-x-0` + `ContentFrame`'s built-in `mx-auto max-w-[1152px]`
          center the 1152px box within the 1440px span, landing its left
          edge at exactly 144px — the same gutter every sibling section
          uses, reproduced here via absolute positioning instead of normal
          flow since the KV logo must sit at a fixed offset regardless of
          the gold-title zone that follows below (313:8453, not part of
          this band). */}
      <ContentFrame
        width={1152}
        className="absolute inset-x-0 top-26 z-10 flex flex-col items-start gap-[130px]"
      >
        {/* mm:2789:12915 */}
        <Image
          src="/homepage-saa/Root-Further-Logo.png"
          alt="Keyvisual Sun* Annual Awards 2025"
          width={338}
          height={150}
          priority
          className="h-auto w-[338px]"
        />
       <div className="flex w-full flex-col items-start gap-4">
          <p className="w-full font-montserrat text-[24px] leading-[32px] font-bold text-center text-white">
            Sun* Annual Awards 2025
          </p>
          <h1 className="w-full font-montserrat text-[57px] leading-[64px] font-bold tracking-[-0.25px] text-center text-[#FFEA9E]">
            {dictionary.awards.title.heading}
          </h1>
        </div>
      </ContentFrame>
    </PageGutter>
  );
}
