import type { KudosPerson } from "./kudos-types";

/**
 * MoMorph design ground truth (researcher-260707-0110) shows a small
 * "danh hiệu" badge chip under each avatar name on the card (component set
 * `3007:17505` — "Rising Hero" / "Legend Hero" / "New Hero" variants). No
 * per-person reward tier exists anywhere in this mock project, so each
 * mock person is deterministically assigned one of the design's literal
 * badge strings by name (same hash technique as `avatar.tsx`'s `colorFor`
 * — stable across renders, no hydration mismatch).
 *
 * `KudosPerson` (`kudos-types.ts`, owned by another concurrent task) is
 * NOT extended with this field — `PersonWithBadge`/`personBadge` below are
 * the sanctioned, defensive way to attach and read it without touching
 * that file. Split out of `kudos-data.ts` to keep both files under the
 * 200-line budget; `kudos-data.ts` re-exports `personBadge` so callers can
 * keep importing it from the "database" module.
 */
const BADGES = ["Rising Hero", "Legend Hero", "New Hero"] as const;

export interface PersonWithBadge extends KudosPerson {
  badge?: string;
}

function badgeFor(name: string): string {
  const sum = name.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return BADGES[sum % BADGES.length];
}

/** Stable mock `id` derived from `name` (diacritics stripped, kebab-cased) —
 * `getDistinctRecipients` already treats `name` as the unique key for mock
 * people, so a name-derived slug is a safe, deterministic stand-in for the
 * real `profiles.id` UUID used once Supabase is configured. Without this,
 * every mock recipient's `id` was `undefined`, so the compose form's
 * `toCreateKudosInput` always serialized `receiverId: ""` — which
 * `validateCreateKudosInput` rejects as `invalid_recipient` regardless of
 * whether Supabase is configured (validation runs before the mock-mode
 * skip check), silently rolling back every optimistic post in mock mode. */
function slugFor(name: string): string {
  return `mock-${name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
}

/** Defensive accessor — `person` is typed as plain `KudosPerson` at every
 * call site (`KudosCard`'s prop type flows from `KudosPost`), so reading
 * the badge requires this narrow, local cast rather than widening the
 * shared type. Returns `undefined` for any person with no badge attached
 * (e.g. F007 compose-form recipients). */
export function personBadge(person: KudosPerson): string | undefined {
  return (person as PersonWithBadge).badge;
}

/** Builds one `PersonWithBadge` — every `KUDOS_POSTS` sender/recipient
 * goes through this so the badge assignment stays in one place. */
export function personWithBadge(name: string, department: string, stars: number): PersonWithBadge {
  return { id: slugFor(name), name, department, stars, badge: badgeFor(name) };
}
