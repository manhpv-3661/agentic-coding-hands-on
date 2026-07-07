import type { KudosFilterState, KudosPerson, KudosPost } from "./kudos-types";

/**
 * Pure shaping functions over `KUDOS_POSTS` (or any `KudosPost[]`). No
 * React, no I/O — safe to call from a Server Component (`page.tsx`) or a
 * client component (`kudos-board.tsx`) alike.
 */

/**
 * FR-4: you cannot like a Kudos you authored.
 *
 * Bug fix (self-like loophole): posting anonymously used to bypass this
 * rule entirely, because the old name-only check compared `post.sender`
 * (the nickname) against `currentUser.name` — never a match. Every post
 * built by `buildKudosPost` now carries `sentByCurrentUser: true` (set
 * regardless of anonymity), so that flag is checked first and wins.
 *
 * For posts NOT authored by the viewer, `anonymous` posts skip the name
 * comparison altogether — otherwise an anonymous nickname that happens to
 * collide with the viewer's own real name would false-block them from
 * liking someone else's post (finding M5).
 *
 * `sentByCurrentUser`/`anonymous` are both undefined on the F006 seed
 * dataset (`kudos-data.ts`), so seed posts fall through to the original
 * name comparison unchanged. Pure.
 */
export function canLikeKudos(post: KudosPost, currentUser: KudosPerson): boolean {
  if (post.sentByCurrentUser) return false;
  if (post.anonymous) return true;
  return post.sender.name !== currentUser.name;
}

/** Distinct hashtags across all posts, in first-seen order. */
export function getDistinctHashtags(posts: KudosPost[]): string[] {
  return Array.from(new Set(posts.flatMap((post) => post.hashtags)));
}

/** Distinct departments across all sender/recipient sides, in first-seen
 * order. */
export function getDistinctDepartments(posts: KudosPost[]): string[] {
  return Array.from(
    new Set(posts.flatMap((post) => [post.sender.department, post.recipient.department])),
  );
}

/**
 * Applies the hashtag/department filter (FR-15/16): a post matches when
 * its hashtags include the selected hashtag (or no hashtag is selected)
 * AND either side's department equals the selected department (or no
 * department is selected). `null` on either field means "all" for that
 * dimension. Does not mutate `posts`.
 */
export function filterKudos(posts: KudosPost[], filter: KudosFilterState): KudosPost[] {
  return posts.filter((post) => {
    const hashtagMatches = filter.hashtag === null || post.hashtags.includes(filter.hashtag);
    const departmentMatches =
      filter.department === null ||
      post.sender.department === filter.department ||
      post.recipient.department === filter.department;

    return hashtagMatches && departmentMatches;
  });
}

/**
 * Top-`n` posts by `hearts`, descending. Stable for ties (relies on
 * `Array#sort`'s stable sort, ES2019+). Does not mutate `posts`. Feeds the
 * Highlight Kudos carousel (FR-6).
 */
export function getTopKudosByHearts(posts: KudosPost[], n = 5): KudosPost[] {
  return [...posts].sort((a, b) => b.hearts - a.hearts).slice(0, n);
}

/**
 * Distinct people (from both the sender and recipient side of every post),
 * deduped by name, in first-seen order, excluding `currentUser` — the
 * compose form's "Người nhận" option list (F007, FR-3). There is no
 * employee-directory data model in this repo, so this mock dataset itself
 * is the stand-in "database" (mirrors `getDistinctHashtags`/
 * `getDistinctDepartments`). Does not mutate `posts`.
 */
export function getDistinctRecipients(
  posts: KudosPost[],
  currentUser: KudosPerson,
): KudosPerson[] {
  const seen = new Set<string>([currentUser.name]);
  const people: KudosPerson[] = [];

  for (const post of posts) {
    for (const person of [post.sender, post.recipient]) {
      if (!seen.has(person.name)) {
        seen.add(person.name);
        people.push(person);
      }
    }
  }

  return people;
}
