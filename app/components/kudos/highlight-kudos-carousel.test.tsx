import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HighlightKudosCarousel } from "./highlight-kudos-carousel";
import type { KudosPerson, KudosPost } from "@/lib/kudos/kudos-types";

const cardLabels = {
  viewDetail: "Xem chi tiết",
  copyLink: "Copy Link",
  copied: "Đã sao chép",
  like: "Thả tim",
  unlike: "Bỏ thả tim",
};

const currentUser: KudosPerson = { name: "Current User", department: "Dept X", stars: 0 };

function makePosts(count: number, overrides?: Partial<KudosPost>): KudosPost[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i}`,
    sender: { name: `Sender ${i}`, department: "Dept A", stars: 1 },
    recipient: { name: `Recipient ${i}`, department: "Dept B", stars: 1 },
    timestamp: "09:00 - 01/01/2026",
    content: `Content ${i}`,
    hashtags: ["#tag"],
    imageCount: 0,
    hearts: i,
    ...overrides,
  }));
}

describe("HighlightKudosCarousel", () => {
  it("renders the section heading and N highlight cards", () => {
    const posts = makePosts(3);
    render(
      <HighlightKudosCarousel posts={posts} cardLabels={cardLabels} emptyLabel="empty" />,
    );

    expect(screen.getByRole("heading", { name: "HIGHLIGHT KUDOS" })).toBeInTheDocument();
    expect(screen.getByText("Content 0")).toBeInTheDocument();
    expect(screen.getByText("Content 1")).toBeInTheDocument();
    expect(screen.getByText("Content 2")).toBeInTheDocument();
    expect(screen.getByText("1/3")).toBeInTheDocument();
  });

  it("disables the previous arrow at the first slide and the next arrow at the last", async () => {
    const posts = makePosts(2);
    const user = userEvent.setup();
    render(
      <HighlightKudosCarousel posts={posts} cardLabels={cardLabels} emptyLabel="empty" />,
    );

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("2/2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" })).not.toBeDisabled();
  });

  it("advances pagination when clicking next", async () => {
    const posts = makePosts(5);
    const user = userEvent.setup();
    render(
      <HighlightKudosCarousel posts={posts} cardLabels={cardLabels} emptyLabel="empty" />,
    );

    expect(screen.getByText("1/5")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("2/5")).toBeInTheDocument();
  });

  it("shows the empty-state message and no arrows when there are no posts (FR-8)", () => {
    render(<HighlightKudosCarousel posts={[]} cardLabels={cardLabels} emptyLabel="Hiện tại chưa có Kudos nào." />);

    expect(screen.getByText("Hiện tại chưa có Kudos nào.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Previous" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
  });

  it("renders the filtersSlot in the header row", () => {
    render(
      <HighlightKudosCarousel
        posts={makePosts(1)}
        cardLabels={cardLabels}
        emptyLabel="empty"
        filtersSlot={<div data-testid="filters">filters here</div>}
      />,
    );

    expect(screen.getByTestId("filters")).toBeInTheDocument();
  });

  it("renders interactive heart buttons when onToggleLike is wired (F008)", () => {
    const posts = makePosts(1, { hearts: 5, content: "likeable post" });
    const onToggleLike = vi.fn();

    render(
      <HighlightKudosCarousel
        posts={posts}
        cardLabels={cardLabels}
        emptyLabel="empty"
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
    const posts = makePosts(1, { id: "p-liked", hearts: 5 });
    const likedIds = new Set(["p-liked"]);

    render(
      <HighlightKudosCarousel
        posts={posts}
        cardLabels={cardLabels}
        emptyLabel="empty"
        likedIds={likedIds}
        currentUser={currentUser}
        onToggleLike={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: cardLabels.unlike })).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument(); // 5 hearts + 1 like
  });

  it("disables the heart for own posts (F008 FR-4)", () => {
    const posts = makePosts(1, { id: "own-post", sender: currentUser });

    render(
      <HighlightKudosCarousel
        posts={posts}
        cardLabels={cardLabels}
        emptyLabel="empty"
        likedIds={new Set()}
        currentUser={currentUser}
        onToggleLike={vi.fn()}
      />,
    );

    const heartButton = screen.getByRole("button", { name: cardLabels.like });
    expect(heartButton).toBeDisabled();
  });

  it("falls back to static heart when onToggleLike is omitted (F006 backward compat)", () => {
    const posts = makePosts(1, { hearts: 10 });

    render(
      <HighlightKudosCarousel posts={posts} cardLabels={cardLabels} emptyLabel="empty" />,
    );

    // When onToggleLike is omitted, the heart is a static span, not a button
    const heartButton = screen.queryByRole("button", { name: cardLabels.like });
    expect(heartButton).not.toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });
});
