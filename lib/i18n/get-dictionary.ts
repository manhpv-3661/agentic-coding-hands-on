import type { Locale } from "./locale";
import type { Dictionary } from "./dictionary";
import { vi } from "./dictionaries/vi";
import { en } from "./dictionaries/en";

/**
 * Pure, synchronous locale → dictionary map. No I/O — locale resolution
 * (the only async step) happens in `get-locale.ts`.
 */
export function getDictionary(locale: Locale): Dictionary {
  return locale === "en" ? en : vi;
}
