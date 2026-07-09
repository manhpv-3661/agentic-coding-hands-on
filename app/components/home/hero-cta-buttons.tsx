import Link from "next/link";
import type { SVGProps } from "react";

/**
 * Up-right arrow icon shared by both hero CTA buttons — MoMorph component
 * `186:2691` (MM_MEDIA_Up), exported with `fill="white"` baked in. Inlined
 * with `currentColor` so each button's text color drives the icon color
 * (code-rules.md rule 2a).
 */
function IconUp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M8.49945 18.3104L5.68945 15.5004L12.0595 9.12043H7.10945V5.69043H18.3095V16.8904H14.8895V11.9404L8.49945 18.3104Z"
        fill="currentColor"
      />
    </svg>
  );
}

export interface HeroCtaButtonsProps {
  /** "ABOUT AWARDS" destination — defaults to `/awards` (FR-17), matching
   * the header's "Award Information" nav link (see site-header.tsx). */
  aboutAwardsHref?: string;
  /** "ABOUT KUDOS" destination — defaults to `/kudos` (FR-17), matching
   * the header's "Sun* Kudos" nav link. */
  aboutKudosHref?: string;
  /** "ABOUT AWARDS" button label (`homepage.hero.cta.aboutAwards`). */
  aboutAwards: string;
  /** "ABOUT KUDOS" button label (`homepage.hero.cta.aboutKudos`). */
  aboutKudos: string;
}

/**
 * Hero CTA buttons — MoMorph node `2167:9062` (mms_B3_Call-To-Action), both
 * instances of component set `186:1426`: a solid primary button (`186:1567`,
 * "ABOUT AWARDS") and an outlined secondary button (`186:2757`,
 * "ABOUT KUDOS").
 * https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
 */
export function HeroCtaButtons({
  aboutAwardsHref = "/awards",
  aboutKudosHref = "/kudos",
  aboutAwards,
  aboutKudos,
}: HeroCtaButtonsProps) {
  return (
    // mm:2167:9062
    <div className="flex flex-row items-start gap-10">
      {/* mm:2167:9063 */}
      <Link
        href={aboutAwardsHref}
        className="flex items-center gap-2 rounded-lg bg-[#FFEA9E] px-6 py-4 text-[#00101A] transition-opacity duration-200 ease-out hover:opacity-90"
      >
        {/* mm:I2167:9063;186:1935 */}
        <span className="flex items-center gap-1">
          {/* mm:I2167:9063;186:1568 */}
          <span className="font-montserrat text-center text-[22px] leading-7 font-bold">
            {aboutAwards}
          </span>
        </span>
        {/* mm:I2167:9063;186:1766 */}
        <IconUp className="h-6 w-6" />
      </Link>
      {/* mm:2167:9064 */}
      <Link
        href={aboutKudosHref}
        className="flex items-center gap-2 rounded-lg border border-[#998C5F] bg-[#FFEA9E1A] px-6 py-4 text-white transition-colors duration-200 ease-out hover:bg-white/10"
      >
        {/* mm:I2167:9064;186:2758 */}
        <span className="flex items-center gap-1">
          {/* mm:I2167:9064;186:2760 */}
          <span className="font-montserrat text-center text-[22px] leading-7 font-bold">
            {aboutKudos}
          </span>
        </span>
        {/* mm:I2167:9064;186:2761 */}
        <IconUp className="h-6 w-6" />
      </Link>
    </div>
  );
}
