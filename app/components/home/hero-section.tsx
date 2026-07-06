import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { CountdownTimer } from "./countdown-timer";
import { EventInfo } from "./event-info";
import { HeroCtaButtons } from "./hero-cta-buttons";

export interface HeroSectionProps {
  /** Hero copy — event info, comingSoon subtitle, CTA labels
   * (`homepage.hero`). */
  hero: Dictionary["homepage"]["hero"];
  /** Days/Hours/Minutes unit labels, shared with the Prelaunch countdown
   * (`shared.countdown`). */
  countdown: Dictionary["shared"]["countdown"];
}

/**
 * Homepage SAA hero ("Bìa") section — MoMorph nodes:
 * - `2167:9030` Bìa → `2167:9031` Frame 487 (hero content: logo, countdown +
 *   event info, CTA buttons)
 * https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
 *
 * Only the hero card (Frame 487) is rendered here. `Bìa`'s other children
 * (Root Further / Awards / Kudos sections further down the page) belong to
 * different sections of the screen and are out of scope for this component.
 * The keyvisual background image + gradient (MoMorph nodes `2167:9027`,
 * `2167:9029`) are rendered once at the page root (`app/page.tsx`) instead of
 * scoped inside this section, because in Figma they sit BEHIND both the
 * sticky header (which has a semi-transparent fill) and this hero card — see
 * `app/page.tsx` for that shared background layer.
 *
 * Containered layout (code-rules.md rule 3): the Figma artboard is 1512px
 * wide with a 1224px content frame centered via 144px side padding
 * (1512 - 2*144 = 1224) — reproduced as `max-w-[1224px]` inside responsive
 * padding, not a hardcoded 1512px-wide wrapper, so the section fills the
 * real viewport at any width.
 */
export function HeroSection({ hero, countdown }: HeroSectionProps) {
  return (
    // mm:2167:9030
    <section className="relative flex w-full items-center justify-center px-6 py-12 sm:px-10 lg:px-36 lg:py-24">
      {/* mm:2167:9031 */}
      <div className="flex w-full max-w-[1224px] flex-col items-start gap-10">
        {/* mm:2167:9032 */}
        <div className="flex flex-col items-start">
          {/* mm:2788:12911 */}
          <Image
            src="/homepage-saa/Root-Further-Logo.png"
            alt="Root Further"
            width={451}
            height={200}
            priority
            className="h-auto w-[240px] sm:w-[340px] lg:w-[451px]"
          />
        </div>
        {/* mm:2167:9034 */}
        <div className="flex flex-col items-start gap-4">
          <CountdownTimer labels={countdown} comingSoon={hero.comingSoon} />
          <EventInfo
            timeLabel={hero.eventInfo.timeLabel}
            venueLabel={hero.eventInfo.venueLabel}
            livestreamNote={hero.eventInfo.livestreamNote}
            eventDate={hero.eventDate}
          />
        </div>
        <HeroCtaButtons aboutAwards={hero.cta.aboutAwards} aboutKudos={hero.cta.aboutKudos} />
      </div>
    </section>
  );
}
