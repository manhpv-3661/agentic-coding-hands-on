import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AllKudosFeed } from "./all-kudos-feed";
import type { KudosPerson, KudosPost } from "@/lib/kudos/kudos-types";

const cardLabels = {
  viewDetail: "Xem chi tiết",
  copyLink: "Copy Link",
  copied: "Đã sao chép",
  copyFailed: "Sao chép thất bại",
  like: "Thả tim",
  unlike: "Bỏ thả tim",
};

const currentUser: KudosPerson = { name: "Current User", department: "Dept X", stars: 0 };

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

describe("AllKudosFeed", () => {
  it("renders one feed card per post", () => {
    // The "ALL KUDOS" heading is owned by kudos-board.tsx (rendered
    // full-width above the feed/sidebar row), not by AllKudosFeed itself —
    // see kudos-board.test.tsx for the composed assertion.
    const posts = [makePost({ id: "a" }), makePost({ id: "b" })];
    render(
      <AllKudosFeed posts={posts} cardLabels={cardLabels} emptyLabel="empty" onHashtagClick={vi.fn()} />,
    );

    expect(screen.getAllByText("Sender")).toHaveLength(2);
  });

  it("forwards the clicked hashtag up via onHashtagClick", async () => {
    const onHashtagClick = vi.fn();
    const user = userEvent.setup();
    render(
      <AllKudosFeed
        posts={[makePost({ hashtags: ["#teamwork"] })]}
        cardLabels={cardLabels}
        emptyLabel="empty"
        onHashtagClick={onHashtagClick}
      />,
    );

    await user.click(screen.getByRole("button", { name: "#teamwork" }));
    expect(onHashtagClick).toHaveBeenCalledWith("#teamwork");
  });

  it("renders the empty-state message when there are no posts (FR-14)", () => {
    render(
      <AllKudosFeed
        posts={[]}
        cardLabels={cardLabels}
        emptyLabel="Hiện tại chưa có Kudos nào."
        onHashtagClick={vi.fn()}
      />,
    );

    expect(screen.getByText("Hiện tại chưa có Kudos nào.")).toBeInTheDocument();
  });

  it("renders interactive heart buttons when onToggleLike is wired (F008)", () => {
    const posts = [makePost({ id: "likeable", hearts: 5, content: "likeable post" })];
    const onToggleLike = vi.fn();

    render(
      <AllKudosFeed
        posts={posts}
        cardLabels={cardLabels}
        emptyLabel="empty"
        onHashtagClick={vi.fn()}
        likedIds={new Set()}
        currentUser={currentUser}
        onToggleLike={onToggleLike}
      />,
    );

    const heartButton = screen.getByRole("button", { name: cardLabels.like });
    expect(heartButton).toBeInTheDocument();
    expect(heartButton).not.toBeDisabled();
  });

  it("shows liked state when a post id is in likedIds (F008)", () => {
    const posts = [makePost({ id: "p-liked", hearts: 5 })];
    const likedIds = new Set(["p-liked"]);

    render(
      <AllKudosFeed
        posts={posts}
        cardLabels={cardLabels}
        emptyLabel="empty"
        onHashtagClick={vi.fn()}
        likedIds={likedIds}
        currentUser={currentUser}
        onToggleLike={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: cardLabels.unlike })).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument(); // 5 hearts + 1 like
  });

  it("disables the heart for own posts (F008 FR-4)", () => {
    const posts = [makePost({ id: "own-post", sender: currentUser })];

    render(
      <AllKudosFeed
        posts={posts}
        cardLabels={cardLabels}
        emptyLabel="empty"
        onHashtagClick={vi.fn()}
        likedIds={new Set()}
        currentUser={currentUser}
        onToggleLike={vi.fn()}
      />,
    );

    const heartButton = screen.getByRole("button", { name: cardLabels.like });
    expect(heartButton).toBeDisabled();
  });

  it("falls back to static heart when onToggleLike is omitted (F006 backward compat)", () => {
    const posts = [makePost({ id: "static-heart", hearts: 10 })];

    render(
      <AllKudosFeed posts={posts} cardLabels={cardLabels} emptyLabel="empty" onHashtagClick={vi.fn()} />,
    );

    // When onToggleLike is omitted, the heart is a static span, not a button
    const heartButton = screen.queryByRole("button", { name: cardLabels.like });
    expect(heartButton).not.toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });
});
