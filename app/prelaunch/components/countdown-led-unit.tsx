import { Orbitron } from "next/font/google";

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
 * Font note: Figma digit text nodes use `fontFamily: "Digital Numbers"`,
 * which is not a real Google Fonts family. Substituting `Orbitron`, per the
 * same decision already made for the homepage countdown (see the comment
 * there) — kept consistent across the app.
 *
 * Pure presentational component: `value`/`label` are plain string props, so
 * wiring the real `useEventCountdown()` output is a trivial pass-through
 * (see `prelaunch-content.tsx`).
 */

const orbitron = Orbitron({ subsets: ["latin"], weight: "400", display: "swap" });

export interface CountdownLedUnitProps {
  /** Already 2-digit zero-padded value (e.g. "05"), per `CountdownState`. */
  value: string;
  /** Uppercase unit label, e.g. "DAYS" / "HOURS" / "MINUTES". */
  label: string;
}

/**
 * One LED digit box per character of `value` — mm:2268:35140 ("Frame 485").
 */
function DigitBoxes({ value }: { value: string }) {
  const digits = value.split("");

  return (
    <div className="flex items-center gap-3 lg:gap-[21px]">
      {digits.map((digit, index) => (
        <div
          key={index}
          className="relative flex h-[81.92px] w-[51.2px] items-center justify-center lg:h-[122.88px] lg:w-[76.8px]"
        >
          <div className="absolute inset-0 rounded-xl border-[0.75px] border-[#FFEA9E] bg-linear-to-b from-white to-white/10 opacity-50 backdrop-blur-[24.96px]" />
          <span
            className={`${orbitron.className} relative text-[49.152px] text-white lg:text-[73.728px]`}
          >
            {digit}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CountdownLedUnit({ value, label }: CountdownLedUnitProps) {
  return (
    // mm:2268:35139 ("1_Days" / "2_Hours" / "3_Minutes")
    <div className="flex flex-col items-center gap-3 lg:items-start lg:gap-[21px]">
      <DigitBoxes value={value} />
      <span className="font-montserrat text-2xl leading-8 font-bold text-white lg:text-4xl lg:leading-[48px]">
        {label}
      </span>
    </div>
  );
}
