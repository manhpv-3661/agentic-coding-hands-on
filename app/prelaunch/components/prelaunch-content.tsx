import { CountdownLedUnit } from "./countdown-led-unit";

/**
 * Static title + DAYS/HOURS/MINUTES countdown row for the Countdown -
 * Prelaunch page. MoMorph node `2268:35136` ("Countdown time").
 * https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU
 *
 * Pure presentational — `days`/`hours`/`minutes` are plain 2-digit
 * zero-padded strings (the `CountdownState` shape from
 * `lib/event-countdown.ts`), passed in as props. Backend/integration wires
 * the real `useEventCountdown()` output straight into these props; this
 * component has no knowledge of the hook, env vars, or auto-redirect logic
 * (out of scope here — see `docs/features/countdown-prelaunch/*`).
 *
 * Title text is static Vietnamese, not translated by `NEXT_LOCALE` — same
 * precedent as F001/F002 (see clarifications.md, F003 session 2026-07-06).
 */
export interface PrelaunchContentProps {
  /** Zero-padded (2-digit) day count, 00-99. */
  days: string;
  /** Zero-padded (2-digit) hour count, 00-23. */
  hours: string;
  /** Zero-padded (2-digit) minute count, 00-59. */
  minutes: string;
}

export function PrelaunchContent({ days, hours, minutes }: PrelaunchContentProps) {
  return (
    // mm:2268:35136
    <div className="flex flex-col items-center gap-6 px-6 text-center">
      {/* mm:2268:35137 */}
      <p className="font-montserrat text-2xl leading-8 font-bold text-white lg:text-4xl lg:leading-[48px]">
        Sự kiện sẽ bắt đầu sau
      </p>
      {/* mm:2268:35138 — flex-wrap so DAYS/HOURS/MINUTES reflow onto a
          second line on narrow viewports instead of overflowing (same
          pattern as the homepage countdown row, `countdown-timer.tsx`) */}
      <div className="flex flex-row flex-wrap items-start justify-center gap-6 sm:gap-10 lg:gap-[60px]">
        {/* mm:2268:35139 */}
        <CountdownLedUnit value={days} label="DAYS" />
        {/* mm:2268:35144 */}
        <CountdownLedUnit value={hours} label="HOURS" />
        {/* mm:2268:35149 */}
        <CountdownLedUnit value={minutes} label="MINUTES" />
      </div>
    </div>
  );
}
