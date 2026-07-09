import { parseEventStart } from "@/lib/event-countdown";
import type { Locale } from "@/lib/i18n/locale";

/**
 * BCP-47 tags `Intl.DateTimeFormat` uses per locale. Kept as its own 2-entry
 * copy rather than importing `lib/awards/format-prize-amount.ts`'s
 * `INTL_LOCALE_TAG` — that map is scoped to phase-02's currency formatting
 * (`lib/awards/*` is out of this phase's ownership), and duplicating one
 * 2-line lookup is cheaper than reaching into an unrelated feature's file.
 */
const INTL_LOCALE_TAG: Record<Locale, string> = {
  vi: "vi-VN",
  en: "en-US",
};

/** Long-form date (e.g. "December 31, 2025" / "31 tháng 12, 2025") —
 * matches the style of the previous English literal
 * (`en.ts`'s `homepage.hero.eventDate`, "December 26, 2025") while letting
 * `Intl` render the Vietnamese form idiomatically instead of forcing the
 * old slash-numeric literal (`vi.ts`'s "26/12/2025") onto a locale-neutral
 * format. */
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

/**
 * Formats the homepage's displayed event date from `NEXT_PUBLIC_EVENT_START_AT`
 * — the SAME timestamp that gates the Prelaunch redirect (`proxy.ts`) and
 * drives the countdown (`lib/event-countdown.ts`) — via `Intl.DateTimeFormat`,
 * instead of the two hand-typed dictionary literals that had drifted both
 * from the env var and from each other (`en.ts`'s "December 26, 2025" vs.
 * `vi.ts`'s "26/12/2025" vs. the env var's actual Dec-31 default). After this
 * change there is exactly one source of truth for the date; the dictionary
 * literals are no longer read for rendering.
 *
 * Reuses `parseEventStart` (not a second parser) so an invalid/missing env
 * value degrades the same way here as it does for the countdown — this
 * function never throws, returning `""` instead (matches the "never throw"
 * convention shared by every repo/formatter in this codebase).
 *
 * @param rawEventStartAt Defaults to `process.env.NEXT_PUBLIC_EVENT_START_AT`;
 *   overridable for tests so they don't depend on process env.
 */
export function formatEventDate(
  locale: Locale,
  rawEventStartAt: string | undefined = process.env.NEXT_PUBLIC_EVENT_START_AT,
): string {
  const target = parseEventStart(rawEventStartAt);
  if (!target) return "";

  return new Intl.DateTimeFormat(INTL_LOCALE_TAG[locale], DATE_FORMAT_OPTIONS).format(target);
}
