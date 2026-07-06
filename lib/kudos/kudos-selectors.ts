import type { KudosFilterState, KudosPost } from "./kudos-types";

/**
 * Pure shaping functions over `KUDOS_POSTS` (or any `KudosPost[]`). No
 * React, no I/O — safe to call from a Server Component (`page.tsx`) or a
 * client component (`kudos-board.tsx`) alike.
 */

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
