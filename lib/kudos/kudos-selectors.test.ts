import { describe, expect, it } from "vitest";
import {
  filterKudos,
  getDistinctDepartments,
  getDistinctHashtags,
  getTopKudosByHearts,
} from "./kudos-selectors";
import { KUDOS_POSTS } from "./kudos-data";
import type { KudosPost } from "./kudos-types";

function makePost(overrides: Partial<KudosPost>): KudosPost {
  return {
    id: "p1",
    sender: { name: "Sender", department: "Dept A", stars: 1 },
    recipient: { name: "Recipient", department: "Dept B", stars: 1 },
    timestamp: "09:00 - 01/01/2026",
    content: "content",
    hashtags: ["#tag"],
    imageCount: 0,
    hearts: 1,
    ...overrides,
  };
}

describe("getDistinctHashtags", () => {
  it("dedupes hashtags across posts", () => {
    const posts = [
      makePost({ hashtags: ["#a", "#b"] }),
      makePost({ hashtags: ["#b", "#c"] }),
    ];

    expect(getDistinctHashtags(posts)).toEqual(["#a", "#b", "#c"]);
  });

  it("returns an empty array for no posts", () => {
    expect(getDistinctHashtags([])).toEqual([]);
  });

  it("has at least 3 distinct hashtags in the real mock dataset (FR-15)", () => {
    expect(getDistinctHashtags(KUDOS_POSTS).length).toBeGreaterThanOrEqual(3);
  });
});

describe("getDistinctDepartments", () => {
  it("dedupes departments across sender and recipient", () => {
    const posts = [
      makePost({
        sender: { name: "S", department: "Dept A", stars: 1 },
        recipient: { name: "R", department: "Dept B", stars: 1 },
      }),
      makePost({
        sender: { name: "S2", department: "Dept B", stars: 1 },
        recipient: { name: "R2", department: "Dept C", stars: 1 },
      }),
    ];

    expect(getDistinctDepartments(posts)).toEqual(["Dept A", "Dept B", "Dept C"]);
  });

  it("has at least 3 distinct departments in the real mock dataset (FR-15)", () => {
    expect(getDistinctDepartments(KUDOS_POSTS).length).toBeGreaterThanOrEqual(3);
  });
});

describe("filterKudos", () => {
  const posts = [
    makePost({
      id: "p1",
      hashtags: ["#teamwork"],
      sender: { name: "S1", department: "Eng", stars: 1 },
      recipient: { name: "R1", department: "Design", stars: 1 },
    }),
    makePost({
      id: "p2",
      hashtags: ["#innovation"],
      sender: { name: "S2", department: "Design", stars: 1 },
      recipient: { name: "R2", department: "HR", stars: 1 },
    }),
  ];

  it("returns all posts when filter is all-null", () => {
    expect(filterKudos(posts, { hashtag: null, department: null })).toEqual(posts);
  });

  it("applies AND-logic between hashtag and department", () => {
    const result = filterKudos(posts, { hashtag: "#teamwork", department: "Design" });
    expect(result).toEqual([posts[0]]);
  });

  it("matches department on either sender or recipient side", () => {
    const result = filterKudos(posts, { hashtag: null, department: "HR" });
    expect(result).toEqual([posts[1]]);
  });

  it("returns an empty array when no post satisfies both filters (FR-8/FR-14)", () => {
    const result = filterKudos(posts, { hashtag: "#teamwork", department: "HR" });
    expect(result).toEqual([]);
  });

  it("is safe on an empty input", () => {
    expect(filterKudos([], { hashtag: "#teamwork", department: null })).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const copy = [...posts];
    filterKudos(posts, { hashtag: "#teamwork", department: null });
    expect(posts).toEqual(copy);
  });
});

describe("getTopKudosByHearts", () => {
  it("returns at most n posts sorted by hearts descending", () => {
    const posts = [
      makePost({ id: "a", hearts: 10 }),
      makePost({ id: "b", hearts: 50 }),
      makePost({ id: "c", hearts: 30 }),
      makePost({ id: "d", hearts: 5 }),
      makePost({ id: "e", hearts: 20 }),
      makePost({ id: "f", hearts: 99 }),
    ];

    const top = getTopKudosByHearts(posts, 5);

    expect(top.map((p) => p.id)).toEqual(["f", "b", "c", "e", "a"]);
  });

  it("defaults to top 5 when n is omitted", () => {
    const posts = Array.from({ length: 8 }, (_, i) => makePost({ id: `p${i}`, hearts: i }));
    expect(getTopKudosByHearts(posts)).toHaveLength(5);
  });

  it("returns an empty array for empty input", () => {
    expect(getTopKudosByHearts([])).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const posts = [makePost({ id: "a", hearts: 1 }), makePost({ id: "b", hearts: 2 })];
    const copy = [...posts];
    getTopKudosByHearts(posts, 1);
    expect(posts).toEqual(copy);
  });

  it("the real mock dataset's top 5 are sorted descending by hearts (sanity check)", () => {
    const top5 = getTopKudosByHearts(KUDOS_POSTS, 5);
    expect(top5).toHaveLength(5);
    for (let i = 1; i < top5.length; i++) {
      expect(top5[i - 1].hearts).toBeGreaterThanOrEqual(top5[i].hearts);
    }
  });
});
