import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { KudosBoard } from "./kudos-board";
import { vi as viDictionary } from "@/lib/i18n/dictionaries/vi";
import type { KudosPerson, KudosPost } from "@/lib/kudos/kudos-types";

const CURRENT_USER: KudosPerson = { name: "Current User", department: "Eng", stars: 0 };
const likeLabel = viDictionary.kudos.card.like;

function makePost(overrides: Partial<KudosPost>): KudosPost {
  return {
    id: "p1",
    sender: { name: "Sender", department: "Eng", stars: 1 },
    recipient: { name: "Recipient", department: "Design", stars: 1 },
    timestamp: "09:00 - 01/01/2026",
    content: "content",
    hashtags: ["#tag"],
    imageCount: 0,
    hearts: 1,
    ...overrides,
  };
}

describe("KudosBoard", () => {
  it("selecting a hashtag filter narrows both the Highlight carousel and the All Kudos feed (FR-16)", async () => {
    const posts = [
      makePost({ id: "a", hashtags: ["#teamwork"], hearts: 10 }),
      makePost({ id: "b", hashtags: ["#innovation"], hearts: 5, content: "unrelated content" }),
    ];
    const user = userEvent.setup();

    render(
      <KudosBoard
        posts={posts}
        hashtagOptions={["#teamwork", "#innovation"]}
        departmentOptions={["Eng", "Design"]}
        labels={viDictionary.kudos}
        spotlight={<div data-testid="spotlight" />}
        sidebar={<div data-testid="sidebar" />}
        currentUser={CURRENT_USER}
        likedIds={new Set()}
        onToggleLike={vi.fn()}
      />,
    );

    // Both posts fit in the top-5, so each renders once in the Highlight
    // carousel and once in the All Kudos feed (2 occurrences each).
    expect(screen.getAllByText("content").length).toBeGreaterThan(0);
    expect(screen.getAllByText("unrelated content").length).toBeGreaterThan(0);

    await user.selectOptions(screen.getByRole("combobox", { name: /Hashtag/ }), "#teamwork");

    expect(screen.getAllByText("content").length).toBeGreaterThan(0);
    expect(screen.queryByText("unrelated content")).not.toBeInTheDocument();
  });

  it("clicking a hashtag tag in the feed sets the hashtag filter (FR-17)", async () => {
    const posts = [
      makePost({ id: "a", hashtags: ["#teamwork"], content: "teamwork post" }),
      makePost({ id: "b", hashtags: ["#innovation"], content: "innovation post" }),
    ];
    const user = userEvent.setup();

    render(
      <KudosBoard
        posts={posts}
        hashtagOptions={["#teamwork", "#innovation"]}
        departmentOptions={["Eng", "Design"]}
        labels={viDictionary.kudos}
        spotlight={<div data-testid="spotlight" />}
        sidebar={<div data-testid="sidebar" />}
        currentUser={CURRENT_USER}
        likedIds={new Set()}
        onToggleLike={vi.fn()}
      />,
    );

    const tagButtons = screen.getAllByRole("button", { name: "#teamwork" });
    await user.click(tagButtons[0]);

    expect(screen.getAllByText("teamwork post").length).toBeGreaterThan(0);
    expect(screen.queryByText("innovation post")).not.toBeInTheDocument();
  });

  it("renders the spotlight and sidebar slots", () => {
    render(
      <KudosBoard
        posts={[makePost({})]}
        hashtagOptions={[]}
        departmentOptions={[]}
        labels={viDictionary.kudos}
        spotlight={<div data-testid="spotlight" />}
        sidebar={<div data-testid="sidebar" />}
        currentUser={CURRENT_USER}
        likedIds={new Set()}
        onToggleLike={vi.fn()}
      />,
    );

    expect(screen.getByTestId("spotlight")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("keeps page gutter and max-width on separate wrappers to avoid the 864px double-padding regression", () => {
    const { container } = render(
      <KudosBoard
        posts={[makePost({})]}
        hashtagOptions={[]}
        departmentOptions={[]}
        labels={viDictionary.kudos}
        spotlight={<div data-testid="spotlight" />}
        sidebar={<div data-testid="sidebar" />}
        currentUser={CURRENT_USER}
        likedIds={new Set()}
        onToggleLike={vi.fn()}
      />,
    );

    const gutter = container.firstElementChild as HTMLElement | null;
    const content = gutter?.firstElementChild as HTMLElement | null;

    expect(gutter).not.toBeNull();
    // Desktop-only fix (plans/260709-0724-desktop-only-banner-overlay-fix):
    // PageGutter's 144px gutter is now flat at every width, no `lg:` prefix.
    expect(gutter?.className).toContain("px-36");
    expect(gutter?.className).not.toContain("max-w-[1152px]");

    expect(content).not.toBeNull();
    expect(content?.className).toContain("max-w-[1152px]");
    expect(content?.className).not.toContain("px-36");
  });

  it("forwards likedIds/currentUser so a likeable post renders an interactive heart button (F008)", () => {
    const posts = [makePost({ id: "likeable", hearts: 5, content: "likeable post" })];

    render(
      <KudosBoard
        posts={posts}
        hashtagOptions={[]}
        departmentOptions={[]}
        labels={viDictionary.kudos}
        spotlight={<div data-testid="spotlight" />}
        sidebar={<div data-testid="sidebar" />}
        currentUser={CURRENT_USER}
        likedIds={new Set()}
        onToggleLike={vi.fn()}
      />,
    );

    // The post appears in both the Highlight carousel and the All Kudos
    // feed (only 1 post, so it's in the top-5).
    const heartButtons = screen.getAllByRole("button", { name: likeLabel });
    expect(heartButtons.length).toBeGreaterThan(0);
    for (const button of heartButtons) {
      expect(button).not.toBeDisabled();
    }
  });

  it("disables the heart for a post authored by the current user (F008 FR-4)", () => {
    const posts = [
      makePost({ id: "own", hearts: 3, content: "my own post", sender: CURRENT_USER }),
    ];

    render(
      <KudosBoard
        posts={posts}
        hashtagOptions={[]}
        departmentOptions={[]}
        labels={viDictionary.kudos}
        spotlight={<div data-testid="spotlight" />}
        sidebar={<div data-testid="sidebar" />}
        currentUser={CURRENT_USER}
        likedIds={new Set()}
        onToggleLike={vi.fn()}
      />,
    );

    const heartButtons = screen.getAllByRole("button", { name: likeLabel });
    expect(heartButtons.length).toBeGreaterThan(0);
    for (const button of heartButtons) {
      expect(button).toBeDisabled();
    }
  });
});
