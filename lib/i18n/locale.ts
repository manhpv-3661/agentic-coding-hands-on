/**
 * Supported locales for the self-written dictionary i18n system.
 * Cookie-only persistence: `NEXT_LOCALE` (see `get-locale.ts`), no locale
 * routing. See plans/260706-2016-i18n-vi-en-translation/plan.md.
 */
export const LOCALES = ["vi", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "vi";

/**
 * Narrows an unknown value (e.g. a raw cookie string) to a valid `Locale`.
 * Used at the only boundary where untrusted input could reach the
 * dictionary lookup, so a tampered/garbage cookie never indexes it.
 */
export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
