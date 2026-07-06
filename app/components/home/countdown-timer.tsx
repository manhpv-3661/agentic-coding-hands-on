"use client";

import { Orbitron } from "next/font/google";
import { useEventCountdown } from "@/hooks/use-event-countdown";

/**
 * Countdown timer for the Homepage SAA hero — MoMorph node `2167:9035`
 * (mms_B1_Countdown time), reused for the Days/Hours/Minutes units at
 * `2167:9038`, `2167:9043`, `2167:9048`.
 * https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
 *
 * Driven by `useEventCountdown` (FR-12..FR-15): the hook ticks at minute
 * resolution and resolves the target from `eventStartAt`, defaulting to
 * `NEXT_PUBLIC_EVENT_START_AT` (FR-13). The "Comming soon" subtitle only
 * renders while `showComingSoon` is true — hidden once the countdown hits
 * zero/past or the env var is missing/invalid (FR-14/FR-15).
 *
 * Font note: the Figma digit text nodes use `fontFamily: "Digital Numbers"`,
 * which is NOT a real Google Fonts family (checked against the Google Fonts
 * catalog — no match, and `fonts.googleapis.com` 400s on it). Substituting
 * `Orbitron` (also via `next/font/google`), the closest available family
 * with the same geometric, LCD/digital-display numeral look commonly used
 * for countdown UIs.
 */

const orbitron = Orbitron({ subsets: ["latin"], weight: "400", display: "swap" });

export interface CountdownTimerProps {
  /**
   * ISO-8601 date/time string, or `Date`, to count down to. Defaults (via
   * `useEventCountdown`) to `process.env.NEXT_PUBLIC_EVENT_START_AT`.
   */
  eventStartAt?: string | Date | null;
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
            className={`${orbitron.className} relative text-[49.152px] text-white`}
          >
            {digit}
          </span>
        </div>
      ))}
    </div>
  );
}

function CountdownUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex w-29 flex-col items-start justify-center gap-3.5">
      <DigitBoxes value={value} />
      <span className="font-montserrat text-2xl leading-8 font-bold text-white">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({ eventStartAt }: CountdownTimerProps) {
  const { days, hours, minutes, showComingSoon } = useEventCountdown(eventStartAt);

  return (
    // mm:2167:9035
    <div className="flex flex-col items-start gap-4">
      {showComingSoon && (
        // mm:2167:9036
        <p className="font-montserrat text-2xl leading-8 font-bold text-white">
          Comming soon
        </p>
      )}
      {/* mm:2167:9037 */}
      <div className="flex flex-row flex-wrap items-center gap-4 sm:gap-6 lg:gap-10">
        {/* mm:2167:9038 */}
        <CountdownUnit value={days} label="DAYS" />
        {/* mm:2167:9043 */}
        <CountdownUnit value={hours} label="HOURS" />
        {/* mm:2167:9048 */}
        <CountdownUnit value={minutes} label="MINUTES" />
      </div>
    </div>
  );
}
