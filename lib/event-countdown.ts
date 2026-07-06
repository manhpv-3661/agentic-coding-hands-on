/**
 * Pure countdown computation for the homepage event countdown (FR-12..FR-15).
 * No React/DOM dependency so every branch is unit-testable with fake dates.
 */

export type CountdownState = {
  /** Zero-padded (>=2 digits) day count. */
  days: string;
  /** Zero-padded (>=2 digits) hour count (0-23). */
  hours: string;
  /** Zero-padded (>=2 digits) minute count (0-59). */
  minutes: string;
  /** True when the target is missing/invalid/reached — countdown reads 00 00 00. */
  isZero: boolean;
  /** True while a future target is pending; UI shows "Coming soon" only then. */
  showComingSoon: boolean;
};

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

const ZERO_STATE: Readonly<CountdownState> = Object.freeze({
  days: "00",
  hours: "00",
  minutes: "00",
  isZero: true,
  showComingSoon: false,
});

/** Module-level guard so the invalid/missing-env warning fires only once. */
let hasWarnedInvalidEventStart = false;

function warnInvalidEventStartOnce(raw: string | undefined): void {
  if (hasWarnedInvalidEventStart) return;
  hasWarnedInvalidEventStart = true;
  console.warn(
    `[event-countdown] NEXT_PUBLIC_EVENT_START_AT is missing or invalid (received: ${JSON.stringify(
      raw,
    )}). Falling back to a zero countdown.`,
  );
}

/** Zero-pads a non-negative integer to at least 2 digits (e.g. 5 -> "05", 120 -> "120"). */
export function pad2(n: number): string {
  const safe = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  return String(safe).padStart(2, "0");
}

/**
 * Parses `NEXT_PUBLIC_EVENT_START_AT` (or any raw ISO-8601 string) into a Date.
 * Missing or unparsable input returns `null` and logs a warning exactly once
 * per process lifetime (TC ID-60) — it never throws.
 */
export function parseEventStart(raw?: string | null): Date | null {
  if (!raw) {
    warnInvalidEventStartOnce(raw ?? undefined);
    return null;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    warnInvalidEventStartOnce(raw);
    return null;
  }

  return date;
}

/**
 * Computes the days/hours/minutes remaining until `target`.
 * `target === null` or `now >= target` both collapse to the zero state
 * (00 00 00, `showComingSoon: false`) per FR-14/FR-15.
 */
export function computeCountdown(target: Date | null, now: Date): CountdownState {
  if (!target) {
    return { ...ZERO_STATE };
  }

  const remainingMs = target.getTime() - now.getTime();
  if (remainingMs <= 0) {
    return { ...ZERO_STATE };
  }

  const days = Math.floor(remainingMs / MS_PER_DAY);
  const hours = Math.floor((remainingMs % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((remainingMs % MS_PER_HOUR) / MS_PER_MINUTE);

  return {
    days: pad2(days),
    hours: pad2(hours),
    minutes: pad2(minutes),
    isZero: false,
    showComingSoon: true,
  };
}

/**
 * Test-only escape hatch to reset the warn-once guard. Not exported from the
 * package's public surface on purpose — import via the relative path in tests.
 */
export function __resetWarnGuardForTests(): void {
  hasWarnedInvalidEventStart = false;
}
