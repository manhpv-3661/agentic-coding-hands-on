import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HighlightKudosCarousel } from "./highlight-kudos-carousel";
import type { KudosPost } from "@/lib/kudos/kudos-types";

const cardLabels = { viewDetail: "Xem chi tiết", copyLink: "Copy Link", copied: "Đã sao chép" };

function makePosts(count: number): KudosPost[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i}`,
    sender: { name: `Sender ${i}`, department: "Dept A", stars: 1 },
    recipient: { name: `Recipient ${i}`, department: "Dept B", stars: 1 },
    timestamp: "09:00 - 01/01/2026",
    content: `Content ${i}`,
    hashtags: ["#tag"],
    imageCount: 0,
    hearts: i,
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
});
