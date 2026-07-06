import Image from "next/image";

/**
 * Awards page hero keyvisual mini — MoMorph "Hệ thống giải" screen.
 * https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
 * Nodes: `313:8437` (mms_3_Keyvisual bg group) + `313:8439` (Cover gradient)
 * + `313:8450` (KV frame) → `2789:12915` (MM_MEDIA_Root Further Logo).
 *
 * FR-4: static, non-interactive banner — background image (cover,
 * center-crop) + "ROOT FURTHER" logo + subtitle "Sun* Annual Award 2025".
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
    <section className="relative flex h-[280px] w-full items-start overflow-hidden bg-[#00101A] px-6 pt-8 sm:h-[380px] sm:px-10 sm:pt-14 lg:h-[547px] lg:px-36 lg:pt-[104px]">
      <Image
        src="/homepage-saa/Keyvisual-BG.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(0deg, #00101A -4.23%, rgba(0, 19, 32, 0.00) 52.79%)",
        }}
      />
      {/* mm:313:8450 */}
      <div className="relative z-10 flex flex-col items-start gap-3 sm:gap-4 lg:gap-[10px]">
        {/* mm:2789:12915 */}
        <Image
          src="/homepage-saa/Root-Further-Logo.png"
          alt="Keyvisual Sun* Annual Award 2025"
          width={338}
          height={150}
          priority
          className="h-auto w-[160px] sm:w-[240px] lg:w-[338px]"
        />
        <p className="font-montserrat text-base font-bold text-white sm:text-lg lg:text-2xl">
          Sun* Annual Award 2025
        </p>
      </div>
    </section>
  );
}
