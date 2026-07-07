import Image from "next/image";
import { PageGutter } from "../layout/page-layout";

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
export function AwardsHero() {
  return (
    // mm:313:8437 + mm:313:8439
    <PageGutter
      as="section"
      className="relative flex h-[280px] items-start overflow-hidden bg-[#00101A] pt-8 sm:h-[380px] sm:pt-14 lg:h-[547px] lg:pt-[104px]"
    >
      <Image
        src="/homepage-saa/Keyvisual-BG.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
      />
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
      {/* mm:313:8450 */}
      <div className="relative z-10 flex flex-col items-start gap-3 sm:gap-4 lg:gap-[10px]">
        {/* mm:2789:12915 */}
        <Image
          src="/homepage-saa/Root-Further-Logo.png"
          alt="Keyvisual Sun* Annual Awards 2025"
          width={338}
          height={150}
          priority
          className="h-auto w-[160px] sm:w-[240px] lg:w-[338px]"
        />
        <p className="font-montserrat text-base font-bold text-white sm:text-lg lg:text-2xl">
          Sun* Annual Awards 2025
        </p>
      </div>
    </PageGutter>
  );
}
