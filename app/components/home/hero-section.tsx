import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { ContentFrame, PageGutter } from "../layout/page-layout";
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
  /** Venue name (`getEventSettings()`, phase-04) — a plain data value, not
   * hero copy, passed straight through to `EventInfo`. Threading it here
   * (rather than having `EventInfo` fetch it itself) keeps `EventInfo`
   * synchronous so its existing unit tests keep rendering it with plain
   * `@testing-library/react` `render()`, which cannot execute an async
   * Server Component. */
  venueName: string;
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
 * (1512 - 2*144 = 1224) — reproduced via the shared `PageGutter`
 * (144px, desktop-only) wrapping `ContentFrame(1224)`, not a hardcoded
 * 1512px-wide wrapper. Only horizontal padding is reproduced here (mirrors
 * `awards-section.tsx`'s established pattern, since `<main>` has no
 * horizontal padding of its own) — vertical spacing is intentionally NOT
 * duplicated here because `app/page.tsx`'s `<main>` already supplies the
 * Bìa's 120px vertical rhythm for all of its children (see that file's
 * note 1); re-adding it here would double the whitespace above/below the
 * hero card.
 */
export function HeroSection({ hero, countdown, venueName }: HeroSectionProps) {
  return (
    // mm:2167:9030
    <PageGutter as="section" className="relative flex items-center justify-center">
      {/* mm:2167:9031 */}
      <ContentFrame width={1224} className="flex flex-col items-start gap-10">
        {/* mm:2167:9032 */}
        <div className="flex flex-col items-start">
          {/* mm:2788:12911 */}
          <Image
            src="/homepage-saa/Root-Further-Logo.png"
            alt="Root Further"
            width={451}
            height={200}
            priority
            className="h-auto w-112.75"
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
            venueName={venueName}
          />
        </div>
        <HeroCtaButtons aboutAwards={hero.cta.aboutAwards} aboutKudos={hero.cta.aboutKudos} />
      </ContentFrame>
    </PageGutter>
  );
}
