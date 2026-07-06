import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/font/google", () => ({
  Montserrat: vi.fn(() => ({ variable: "--font-montserrat" })),
}));

import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import { AwardsSection } from "./awards-section";

const AWARDS = {
  heading: "Award System",
  items: {
    topTalent: { description: "Top talent description" },
    topProject: { description: "Top project description" },
    topProjectLeader: { description: "Top project leader description" },
    bestManager: { description: "Shared unfinished description" },
    signatureCreator: { description: "Shared unfinished description" },
    mvp: { description: "Shared unfinished description" },
  },
};

describe("AwardsSection", () => {
  it("renders the heading prop verbatim (F005)", () => {
    render(<AwardsSection awards={AWARDS} detailsCta="Details" />);

    expect(screen.getByRole("heading", { level: 2, name: "Award System" })).toBeInTheDocument();
  });

  it("maps each award card's description from awards.items.<slug>.description, in AWARD_CATEGORIES order", () => {
    render(<AwardsSection awards={AWARDS} detailsCta="Details" />);

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(AWARD_CATEGORIES.length);

    expect(screen.getByText("Top talent description")).toBeInTheDocument();
    expect(screen.getByText("Top project description")).toBeInTheDocument();
    expect(screen.getByText("Top project leader description")).toBeInTheDocument();
    // bestManager / signatureCreator / mvp intentionally share one string.
    expect(screen.getAllByText("Shared unfinished description")).toHaveLength(3);
  });

  it("forwards detailsCta to every AwardCard", () => {
    render(<AwardsSection awards={AWARDS} detailsCta="Details" />);

    expect(screen.getAllByText("Details")).toHaveLength(AWARD_CATEGORIES.length);
  });

  it("links every card to /awards#<slug> using AWARD_CATEGORIES order", () => {
    render(<AwardsSection awards={AWARDS} detailsCta="Details" />);

    const headings = screen.getAllByRole("heading", { level: 3 });
    headings.forEach((heading, index) => {
      const link = heading.closest("a");
      expect(link).toHaveAttribute("href", `/awards#${AWARD_CATEGORIES[index].slug}`);
    });
  });
});
