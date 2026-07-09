"use client";

import { digitalNumbers } from "@/app/fonts";
import { useEventCountdown } from "@/hooks/use-event-countdown";
import type { Dictionary } from "@/lib/i18n/dictionary";

/**
 * Countdown timer for the Homepage SAA hero — MoMorph node `2167:9035`
 * (mms_B1_Countdown time), reused for the Days/Hours/Minutes units at
 * `2167:9038`, `2167:9043`, `2167:9048`.
 * https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
 *
 * Driven by `useEventCountdown` (FR-12..FR-15): the hook ticks at minute
 * resolution and resolves the target from `eventStartAt`, defaulting to
 * `NEXT_PUBLIC_EVENT_START_AT` (FR-13). The "coming soon" subtitle only
 * renders while `showComingSoon` is true — hidden once the countdown hits
 * zero/past or the env var is missing/invalid (FR-14/FR-15).
 *
 * Font note: the Figma digit text nodes declare `fontFamily: "Digital
 * Numbers"`, self-hosted via `next/font/local` in `app/fonts.ts` (FR-F5).
 */

interface CountdownTimerProps {
  /**
   * ISO-8601 date/time string, or `Date`, to count down to. Defaults (via
   * `useEventCountdown`) to `process.env.NEXT_PUBLIC_EVENT_START_AT`.
   */
  eventStartAt?: string | Date | null;
  /** Days/Hours/Minutes unit labels — shared verbatim with the Prelaunch
   * countdown (`shared.countdown`, F005). */
  labels: Dictionary["shared"]["countdown"];
  /** "Coming soon" subtitle, rendered while `showComingSoon` is true
   * (`homepage.hero.comingSoon` — fixes the "Comming soon" typo that used
   * to be hardcoded here). */
  comingSoon: string;
}

/**
 * Digit boxes — MoMorph instance template `2167:9040` (Group 5 / Group 4,
 * component `186:2619`). `value` is already zero-padded to >=2 digits by
 * `lib/event-countdown.ts#pad2`, so one box is rendered per character —
 * exactly 2 boxes for the normal 0-99 range the design depicts.
 */
function DigitBoxes({ value }: { value: string }) {
  const digits = value.split("");

  return (
    <div className="flex items-center gap-3.5">
      {digits.map((digit, index) => (
        <div
          key={index}
          className="relative flex h-[81.92px] w-[51.2px] items-center justify-center"
        >
          <div className="absolute inset-0 rounded-lg border-[0.5px] border-[#FFEA9E] bg-linear-to-b from-white to-white/10 opacity-50 backdrop-blur-[16.64px]" />
          <span
            className={`${digitalNumbers.className} relative text-[49.152px] text-white`}
          >
            {digit}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * `w-fit` (not a fixed `w-29`/116px) so the unit hugs `DigitBoxes`' actual
 * rendered width instead of clipping it. Figma's own Frame 485 (2167:9039)
 * is 116px wide, but that's only because it depicts exactly 2 digit boxes
 * (51.2px each + 14px gap = 116.4px) — the design has no 3-digit case to
 * measure. `computeCountdown` (lib/event-countdown.ts) has no upper bound
 * on days, so a countdown started 100+ days out renders 3 digits; a fixed
 * 116px box would then overflow into the neighboring unit. Sizing to
 * content keeps the 2-digit case pixel-identical to Figma while letting
 * the parent row's `flex-wrap` (see `CountdownTimer` below) absorb any
 * extra width instead of colliding with the next unit.
 */
function CountdownUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex w-fit flex-col items-start justify-center gap-3.5">
      <DigitBoxes value={value} />
      <span className="font-montserrat text-2xl leading-8 font-bold text-white">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({ eventStartAt, labels, comingSoon }: CountdownTimerProps) {
  const { days, hours, minutes, showComingSoon } = useEventCountdown(eventStartAt);

  return (
    // mm:2167:9035
    <div className="flex flex-col items-start gap-4">
      {showComingSoon && (
        // mm:2167:9036
        <p className="font-montserrat text-2xl leading-8 font-bold text-white">
          {comingSoon}
        </p>
      )}
      {/* mm:2167:9037 */}
      <div className="flex flex-row flex-wrap items-center gap-10">
        {/* mm:2167:9038 */}
        <CountdownUnit value={days} label={labels.days} />
        {/* mm:2167:9043 */}
        <CountdownUnit value={hours} label={labels.hours} />
        {/* mm:2167:9048 */}
        <CountdownUnit value={minutes} label={labels.minutes} />
      </div>
    </div>
  );
}
