/**
 * Pure dedupe + cap merge rules for hashtag chips, shared by every entry
 * path in `hashtag-input.tsx` — free-text commit, catalog-dropdown toggle,
 * and group-preset apply (Phase 04, `kudos-hashtag-catalog.ts`) all call
 * through here so they can never silently diverge on what counts as a
 * duplicate or when the max cap kicks in. Extracted out of
 * `hashtag-input.tsx` to keep that file under this repo's 200-line
 * convention once the catalog/group entry paths were added.
 */

/** Case-insensitive membership check. */
export function isDuplicateTag(existing: string[], tag: string): boolean {
  return existing.some((candidate) => candidate.toLowerCase() === tag.toLowerCase());
}

/** Auto-prefixes `#` on a raw (trimmed) tag string. */
function normalizeTag(raw: string): string {
  return raw.startsWith("#") ? raw : `#${raw}`;
}

/**
 * Adds one tag respecting case-insensitive dedupe + the `max` cap. Returns
 * the SAME array reference when the add is a no-op (already at max, blank,
 * or a duplicate) so callers can cheaply detect "nothing changed".
 */
export function addTag(current: string[], raw: string, max: number): string[] {
  const trimmed = raw.trim();
  if (!trimmed || current.length >= max) return current;
  const tag = normalizeTag(trimmed);
  if (isDuplicateTag(current, tag)) return current;
  return [...current, tag];
}

/**
 * Applies a batch of tags in order via `addTag`, silently dropping any that
 * would exceed `max` once earlier tags in the batch have filled it (the
 * group preset's resolved "overflow" behavior — no error, no partial
 * rollback of tags already added within the same batch).
 */
export function addTags(current: string[], rawTags: string[], max: number): string[] {
  return rawTags.reduce((acc, raw) => addTag(acc, raw, max), current);
}
