/**
 * Joins truthy class-name fragments with a single space, dropping any
 * falsy values (`false`, `null`, `undefined`, `""`). Behavior-identical
 * replacement for the hand-rolled `` `${base} ${cond && x}` `` idiom
 * duplicated across components — intentionally not `clsx`/`tailwind-merge`
 * (YAGNI, see plans/260709-1710-ui-refactor-cleanup/phase-00-shared-primitives-foundation.md).
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter((part): part is string => Boolean(part)).join(" ");
}
