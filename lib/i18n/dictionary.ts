import { vi } from "./dictionaries/vi";

/**
 * Canonical dictionary shape, derived from the Vietnamese dictionary.
 * `dictionaries/en.ts` is checked against this type via `satisfies
 * Dictionary` — any key missing or mistyped in `en` fails `tsc --noEmit`.
 */
export type Dictionary = typeof vi;
