import { describe, expect, it } from "vitest";
import {
  canLikeKudos,
  filterKudos,
  getDistinctDepartments,
  getDistinctHashtags,
  getDistinctRecipients,
  getTopKudosByHearts,
} from "./kudos-selectors";
import { CURRENT_USER, KUDOS_POSTS } from "./kudos-data";
import type { KudosPerson, KudosPost } from "./kudos-types";

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

describe("canLikeKudos", () => {
  const currentUser: KudosPerson = { name: "Current User", department: "Dept X", stars: 0 };

  it("returns false when the post's sender is the current user (FR-4)", () => {
    const post = makePost({ sender: currentUser });
    expect(canLikeKudos(post, currentUser)).toBe(false);
  });

  it("returns true when the sender is someone else", () => {
    const post = makePost({
      sender: { name: "Someone Else", department: "Dept A", stars: 1 },
    });
    expect(canLikeKudos(post, currentUser)).toBe(true);
  });

  it("returns true for an anonymous sender whose name differs from the current user", () => {
    const post = makePost({
      sender: { name: "Anonymous", department: "Dept A", stars: 0 },
    });
    expect(canLikeKudos(post, currentUser)).toBe(true);
  });

  it("does not consider the recipient side (only sender identity matters)", () => {
    const post = makePost({
      sender: { name: "Someone Else", department: "Dept A", stars: 1 },
      recipient: currentUser,
    });
    expect(canLikeKudos(post, currentUser)).toBe(true);
  });

  it("blocks the author's own anonymous post, even though the sender name differs (self-like loophole fix)", () => {
    const post = makePost({
      sender: { name: "Doraemon", department: "", stars: 0 },
      sentByCurrentUser: true,
      anonymous: true,
    });
    expect(canLikeKudos(post, currentUser)).toBe(false);
  });

  it("allows liking another person's anonymous post even when the nickname matches the current user's real name (M5 fix)", () => {
    const post = makePost({
      sender: { name: currentUser.name, department: "", stars: 0 },
      sentByCurrentUser: false,
      anonymous: true,
    });
    expect(canLikeKudos(post, currentUser)).toBe(true);
  });
});

describe("getDistinctRecipients", () => {
  const currentUser: KudosPerson = { name: "Current User", department: "Dept X", stars: 0 };

  it("dedupes people across both sender and recipient sides, first-seen order", () => {
    const posts = [
      makePost({
        sender: { name: "A", department: "Dept A", stars: 1 },
        recipient: { name: "B", department: "Dept B", stars: 1 },
      }),
      makePost({
        sender: { name: "B", department: "Dept B", stars: 1 },
        recipient: { name: "C", department: "Dept C", stars: 1 },
      }),
    ];

    const result = getDistinctRecipients(posts, currentUser);
    expect(result.map((p) => p.name)).toEqual(["A", "B", "C"]);
  });

  it("excludes the current user even when they appear as a sender/recipient", () => {
    const posts = [
      makePost({
        sender: currentUser,
        recipient: { name: "B", department: "Dept B", stars: 1 },
      }),
    ];

    const result = getDistinctRecipients(posts, currentUser);
    expect(result.map((p) => p.name)).toEqual(["B"]);
  });

  it("returns an empty array for empty input", () => {
    expect(getDistinctRecipients([], currentUser)).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const posts = [makePost({})];
    const copy = [...posts];
    getDistinctRecipients(posts, currentUser);
    expect(posts).toEqual(copy);
  });

  it("excludes CURRENT_USER from the real mock dataset's recipient list", () => {
    const result = getDistinctRecipients(KUDOS_POSTS, CURRENT_USER);
    expect(result.some((p) => p.name === CURRENT_USER.name)).toBe(false);
    expect(result.length).toBeGreaterThan(0);
  });
});
