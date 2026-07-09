import { CountdownLedUnit } from "./countdown-led-unit";

/**
 * Dict slice this component needs: the translated heading plus the SHARED
 * `shared.countdown.*` label set (same keys the homepage countdown row uses
 * — see `lib/i18n/dictionaries/vi.ts`). Built once by `app/prelaunch/page.tsx`
 * and threaded through both the `<Suspense>` fallback and
 * `PrelaunchCountdownClient`.
 */
export interface PrelaunchCountdownContent {
  /** Locale-specific heading, e.g. "Sự kiện sẽ bắt đầu sau" / its EN copy. */
  heading: string;
  labels: {
    days: string;
    hours: string;
    minutes: string;
  };
}

/**
 * Title + DAYS/HOURS/MINUTES countdown row for the Countdown - Prelaunch
 * page. MoMorph node `2268:35136` ("Countdown time").
 * https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU
 *
 * Pure presentational — `days`/`hours`/`minutes` are plain 2-digit
 * zero-padded strings (the `CountdownState` shape from
 * `lib/event-countdown.ts`), passed in as props. Backend/integration wires
 * the real `useEventCountdown()` output straight into these props; this
 * component has no knowledge of the hook, env vars, or auto-redirect logic
 * (out of scope here — see `docs/features/countdown-prelaunch/*`).
 *
 * Heading and countdown labels are now translated by `NEXT_LOCALE` via the
 * `content` prop (F005 i18n initiative) — this supersedes the earlier F003
 * precedent (static Vietnamese, no translation) that used to be documented
 * here; see `plans/260706-2016-i18n-vi-en-translation/clarifications.md`.
 */
export interface PrelaunchContentProps {
  /** Zero-padded (2-digit) day count, 00-99. */
  days: string;
  /** Zero-padded (2-digit) hour count, 00-23. */
  hours: string;
  /** Zero-padded (2-digit) minute count, 00-59. */
  minutes: string;
  /** Locale-resolved heading + countdown labels, built by `page.tsx`. */
  content: PrelaunchCountdownContent;
}

export function PrelaunchContent({ days, hours, minutes, content }: PrelaunchContentProps) {
  return (
    // mm:2268:35136
    <div className="flex flex-col items-center gap-6 px-6 text-center">
      {/* mm:2268:35137 */}
      <p className="font-montserrat text-4xl leading-[48px] font-bold text-white">
        {content.heading}
      </p>
      {/* mm:2268:35138 — flex-wrap keeps DAYS/HOURS/MINUTES from overflowing
          if a label ever runs long (desktop-only sizing, no breakpoint
          scaling — same pattern as the homepage countdown row,
          `countdown-timer.tsx`) */}
      <div className="flex flex-row flex-wrap items-start justify-center gap-[60px]">
        {/* mm:2268:35139 */}
        <CountdownLedUnit value={days} label={content.labels.days} unit="days" />
        {/* mm:2268:35144 */}
        <CountdownLedUnit value={hours} label={content.labels.hours} unit="hours" />
        {/* mm:2268:35149 */}
        <CountdownLedUnit value={minutes} label={content.labels.minutes} unit="minutes" />
      </div>
    </div>
  );
}
