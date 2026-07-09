import { vi } from "./dictionaries/vi";

type BaseDictionary = typeof vi;

/** `compose.hashtags` keys widened to optional by `Dictionary` below —
 * see that type's doc-comment for why. */
type HashtagsShape = BaseDictionary["kudos"]["compose"]["hashtags"];

/**
 * Canonical dictionary shape, derived from the Vietnamese dictionary.
 * `dictionaries/en.ts` is checked against this type via `satisfies
 * Dictionary` — any key missing or mistyped in `en` fails `tsc --noEmit`.
 *
 * `compose.hashtags`'s catalog/group-preset captions (`browse`/`group`/
 * `groups`, Phase 04 — see `lib/kudos/kudos-hashtag-catalog.ts`) are
 * widened to optional here even though both real dictionaries always
 * provide concrete values. Kept optional so hand-written `labels` literals
 * in existing tests (e.g. `compose-dialog.test.tsx`) that predate Phase 04
 * keep compiling without edits — the same rationale `mentionSuggestionsAria`
 * already uses elsewhere in this feature (see its comment in
 * `compose-dialog-fields.tsx`).
 */
export type Dictionary = Omit<BaseDictionary, "kudos"> & {
  kudos: Omit<BaseDictionary["kudos"], "compose"> & {
    compose: Omit<BaseDictionary["kudos"]["compose"], "hashtags"> & {
      hashtags: Omit<HashtagsShape, "browse" | "group" | "groups"> &
        Partial<Pick<HashtagsShape, "browse" | "group" | "groups">>;
    };
  };
};
