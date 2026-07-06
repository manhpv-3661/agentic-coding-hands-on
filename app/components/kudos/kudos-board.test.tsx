import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KudosBoard } from "./kudos-board";
import { vi as viDictionary } from "@/lib/i18n/dictionaries/vi";
import type { KudosPost } from "@/lib/kudos/kudos-types";

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
      />,
    );

    expect(screen.getByTestId("spotlight")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });
});
