import { describe, expect, it } from "vitest";
import { mapRowToKudosPost } from "./kudos-row-mapper";
import type { KudosRowWithRelations } from "./kudos-db-types";

function makeRow(overrides: Partial<KudosRowWithRelations>): KudosRowWithRelations {
  return {
    id: "post-1",
    sender_id: "user-sender",
    receiver_id: "user-receiver",
    title: "Great work",
    content: "Cảm ơn bạn đã hỗ trợ team.",
    hashtags: ["#teamwork"],
    image_urls: ["https://cdn.example.com/kudos/image-1.png"],
    is_anonymous: false,
    anonymous_name: null,
    created_at: "2026-01-01T09:30:00.000Z",
    sender: {
      id: "user-sender",
      full_name: "Nguyễn Văn An",
      avatar_url: null,
      department: "Phòng Kỹ thuật",
    },
    receiver: {
      id: "user-receiver",
      full_name: "Trần Thị Bình",
      avatar_url: null,
      department: "Phòng Thiết kế",
    },
    ...overrides,
  };
}

describe("mapRowToKudosPost", () => {
  it("maps a normal post using the joined sender/receiver profiles", () => {
    const post = mapRowToKudosPost(makeRow({}), 5, null);

    expect(post).toEqual({
      id: "post-1",
      sender: {
        id: "user-sender",
        name: "Nguyễn Văn An",
        department: "Phòng Kỹ thuật",
        stars: 0,
        avatarUrl: undefined,
      },
      recipient: {
        id: "user-receiver",
        name: "Trần Thị Bình",
        department: "Phòng Thiết kế",
        stars: 0,
        avatarUrl: undefined,
      },
      timestamp: expect.any(String),
      title: "Great work",
      content: "Cảm ơn bạn đã hỗ trợ team.",
      hashtags: ["#teamwork"],
      imageCount: 1,
      imageUrls: ["https://cdn.example.com/kudos/image-1.png"],
      hearts: 5,
      sentByCurrentUser: false,
      anonymous: false,
    });
  });

  it("shows the fixed anonymous sender copy for anonymous posts", () => {
    const post = mapRowToKudosPost(
      makeRow({ is_anonymous: true, anonymous_name: "Doraemon" }),
      0,
      null,
    );

    expect(post.sender).toEqual({
      id: "user-sender",
      name: "Doraemon",
      department: "",
      stars: 0,
    });
    expect(post.anonymous).toBe(true);
  });

  it("marks sentByCurrentUser true when sender_id matches the current user id", () => {
    const post = mapRowToKudosPost(makeRow({ sender_id: "user-abc" }), 0, "user-abc");

    expect(post.sentByCurrentUser).toBe(true);
  });

  it("marks sentByCurrentUser false when there is no current user id", () => {
    const post = mapRowToKudosPost(makeRow({ sender_id: "user-abc" }), 0, null);

    expect(post.sentByCurrentUser).toBe(false);
  });

  it("uses the passed likeCount as the total hearts", () => {
    const post = mapRowToKudosPost(makeRow({}), 7, null);

    expect(post.hearts).toBe(7);
  });

  it("falls back to empty department/0 stars when the sender profile is missing", () => {
    const post = mapRowToKudosPost(makeRow({ sender: null }), 0, null);

    expect(post.sender).toEqual({
      id: undefined,
      name: "",
      department: "",
      stars: 0,
      avatarUrl: undefined,
    });
  });
});
