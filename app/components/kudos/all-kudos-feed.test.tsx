import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AllKudosFeed } from "./all-kudos-feed";
import type { KudosPost } from "@/lib/kudos/kudos-types";

const cardLabels = { viewDetail: "Xem chi tiết", copyLink: "Copy Link", copied: "Đã sao chép" };

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
  it("renders the heading and one feed card per post", () => {
    const posts = [makePost({ id: "a" }), makePost({ id: "b" })];
    render(
      <AllKudosFeed posts={posts} cardLabels={cardLabels} emptyLabel="empty" onHashtagClick={vi.fn()} />,
    );

    expect(screen.getByRole("heading", { name: "ALL KUDOS" })).toBeInTheDocument();
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
});
