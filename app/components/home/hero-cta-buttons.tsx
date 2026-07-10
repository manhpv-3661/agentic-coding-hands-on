import Link from "next/link";
import { UpChevronIcon } from "./up-chevron-icon";

interface HeroCtaButtonsProps {
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
        className="flex items-center gap-2 rounded-lg bg-[#FFEA9E] px-6 py-4 text-[#00101A] transition-all duration-200 ease-out hover:scale-105 hover:opacity-90"
      >
        {/* mm:I2167:9063;186:1935 */}
        <span className="flex items-center gap-1">
          {/* mm:I2167:9063;186:1568 */}
          <span className="font-montserrat text-center text-[22px] leading-7 font-bold">
            {aboutAwards}
          </span>
        </span>
        {/* mm:I2167:9063;186:1766 */}
        <UpChevronIcon className="h-6 w-6" />
      </Link>
      {/* mm:2167:9064 */}
      <Link
        href={aboutKudosHref}
        className="flex items-center gap-2 rounded-lg border border-[#998C5F] bg-[#FFEA9E1A] px-6 py-4 text-white transition-all duration-200 ease-out hover:scale-105 hover:bg-white/10"
      >
        {/* mm:I2167:9064;186:2758 */}
        <span className="flex items-center gap-1">
          {/* mm:I2167:9064;186:2760 */}
          <span className="font-montserrat text-center text-[22px] leading-7 font-bold">
            {aboutKudos}
          </span>
        </span>
        {/* mm:I2167:9064;186:2761 */}
        <UpChevronIcon className="h-6 w-6" />
      </Link>
    </div>
  );
}
