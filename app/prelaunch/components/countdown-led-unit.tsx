import { digitalNumbers } from "@/app/fonts";

/**
 * LED-style countdown unit (2-digit box pair + uppercase label) for the
 * Countdown - Prelaunch page. MoMorph:
 * https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU
 * (frame `2268:35127`, unit e.g. "1_Days" `2268:35139`).
 *
 * This is the SAME digit-box component (`componentId: 186:2619`, "Group 5" /
 * "Group 4") already implemented for the Homepage hero countdown at
 * `app/components/home/countdown-timer.tsx` — reproduced here at the
 * Prelaunch frame's own (larger, full-screen) design sizing instead of that
 * screen's scaled-down hero variant.
 *
 * Font note: Figma digit text nodes declare `fontFamily: "Digital Numbers"`,
 * self-hosted via `next/font/local` in `app/fonts.ts` (FR-F5), consistent
 * with the homepage countdown.
 *
 * Pure presentational component: `value`/`label` are plain string props, so
 * wiring the real `useEventCountdown()` output is a trivial pass-through
 * (see `prelaunch-content.tsx`).
 */

/** Which countdown unit a `CountdownLedUnit` renders — drives the per-unit
 * valid range in `UNIT_RANGES` below (mm:2268:35139/35144/35149). */
export type CountdownUnitKind = "days" | "hours" | "minutes";

export interface CountdownLedUnitProps {
  /** Already 2-digit zero-padded value (e.g. "05"), per `CountdownState`. */
  value: string;
  /** Uppercase unit label, e.g. "DAYS" / "HOURS" / "MINUTES". */
  label: string;
  /** Which unit this is, so `DigitBoxes` can apply the right valid range. */
  unit: CountdownUnitKind;
}

/**
 * Per-unit valid range + out-of-range handling, per MoMorph's own validation
 * rules and generated test suite for this screen:
 * - Days (mm:2268:35139, "Phạm vi: 00–99"): the figure is realistically
 *   unbounded above (a prelaunch gate can be deployed months ahead of its
 *   target date), so an out-of-range Days value is CLAMPED to the fixed
 *   2-digit display (e.g. 120 -> 99) — a safe cap, not a fabricated number.
 * - Hours (mm:2268:35144, "Phạm vi: 00–23") / Minutes (mm:2268:35149,
 *   "Phạm vi: 00–59") are derived via modulo arithmetic in
 *   `lib/event-countdown.ts` and can never legitimately fall outside their
 *   range — an out-of-range value there signals corrupted upstream data.
 *   MoMorph's generated test suite (TC f98adad8-f486-4c5b-be69-3dce92c92af0
 *   for Hours, TC 724e6e17-1b9f-4bad-8baa-b48ad9e178be for Minutes) expects
 *   those to RESET to "00" rather than display a clamped-but-still-wrong
 *   number, so they use "reset" instead of "clamp".
 */
const UNIT_RANGES: Record<CountdownUnitKind, { max: number; outOfRange: "clamp" | "reset" }> = {
  days: { max: 99, outOfRange: "clamp" },
  hours: { max: 23, outOfRange: "reset" },
  minutes: { max: 59, outOfRange: "reset" },
};

/**
 * One LED digit box per character of `value` — mm:2268:35140 ("Frame 485").
 *
 * The design frame is a fixed 2-slot box (width:"175px", exactly 2 children
 * per unit). `value` upstream is normally 2-digit zero-padded and within
 * range, but out-of-range input is handled per `unit` via `UNIT_RANGES`
 * (see above) instead of one generic 00-99 clamp for every unit.
 */
function DigitBoxes({ value, unit }: { value: string; unit: CountdownUnitKind }) {
  const { max, outOfRange } = UNIT_RANGES[unit];
  const numeric = Number.parseInt(value, 10);
  const inRange = Number.isFinite(numeric) && numeric >= 0 && numeric <= max;

  const display = inRange
    ? numeric
    : outOfRange === "clamp" && Number.isFinite(numeric)
      ? Math.min(Math.max(numeric, 0), max)
      : 0;

  const digits = String(display).padStart(2, "0").split("");

  return (
    <div className="flex items-center gap-3 lg:gap-[21px]">
      {digits.map((digit, index) => (
        <div
          key={index}
          className="relative flex h-[81.92px] w-[51.2px] items-center justify-center lg:h-[122.88px] lg:w-[76.8px]"
        >
          <div className="absolute inset-0 rounded-xl border-[0.75px] border-[#FFEA9E] bg-linear-to-b from-white to-white/10 opacity-50 backdrop-blur-[24.96px]" />
          <span
            className={`${digitalNumbers.className} relative text-[49.152px] text-white lg:text-[73.728px]`}
          >
            {digit}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CountdownLedUnit({ value, label, unit }: CountdownLedUnitProps) {
  return (
    // mm:2268:35139 ("1_Days" / "2_Hours" / "3_Minutes")
    <div className="flex flex-col items-center gap-3 lg:items-start lg:gap-[21px]">
      <DigitBoxes value={value} unit={unit} />
      <span className="font-montserrat text-2xl leading-8 font-bold text-white lg:text-4xl lg:leading-[48px]">
        {label}
      </span>
    </div>
  );
}
