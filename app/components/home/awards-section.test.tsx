import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/font/google", () => ({
  Montserrat: vi.fn(() => ({ variable: "--font-montserrat" })),
}));

vi.mock("next/font/local", () => ({
  default: vi.fn(() => ({ className: "font-digital-numbers" })),
}));

import { AWARD_CATEGORY_FALLBACK_ROWS } from "@/lib/awards/award-categories-fallback";
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

// Phase-04: the grid's category rows now come from `getAwardCategories()`
// (`lib/awards/award-categories-repository.ts`) instead of an inline array —
// these tests drive `AwardsSection` with the same static fallback rows the
// repo itself returns when Supabase isn't configured, so ordering/slug
// assertions below track the real unconfigured-mode data contract.
const CATEGORIES = AWARD_CATEGORY_FALLBACK_ROWS;

describe("AwardsSection", () => {
  it("renders the heading prop verbatim (F005)", () => {
    render(<AwardsSection awards={AWARDS} detailsCta="Details" categories={CATEGORIES} />);

    expect(screen.getByRole("heading", { level: 2, name: "Award System" })).toBeInTheDocument();
  });

  it("maps each award card's description from awards.items.<slug>.description, in category sort_order", () => {
    render(<AwardsSection awards={AWARDS} detailsCta="Details" categories={CATEGORIES} />);

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(CATEGORIES.length);

    expect(screen.getByText("Top talent description")).toBeInTheDocument();
    expect(screen.getByText("Top project description")).toBeInTheDocument();
    expect(screen.getByText("Top project leader description")).toBeInTheDocument();
    // bestManager / signatureCreator / mvp intentionally share one string.
    expect(screen.getAllByText("Shared unfinished description")).toHaveLength(3);
  });

  it("forwards detailsCta to every AwardCard", () => {
    render(<AwardsSection awards={AWARDS} detailsCta="Details" categories={CATEGORIES} />);

    expect(screen.getAllByText("Details")).toHaveLength(CATEGORIES.length);
  });

  it("links every card to /awards#<slug> using category sort_order", () => {
    render(<AwardsSection awards={AWARDS} detailsCta="Details" categories={CATEGORIES} />);

    const headings = screen.getAllByRole("heading", { level: 3 });
    headings.forEach((heading, index) => {
      const link = heading.closest("a");
      expect(link).toHaveAttribute("href", `/awards#${CATEGORIES[index].slug}`);
    });
  });

  it("skips a category row with no title metadata and warns instead of crashing", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <AwardsSection
        awards={AWARDS}
        detailsCta="Details"
        categories={[
          ...CATEGORIES,
          {
            slug: "unknown-slug",
            sortOrder: 7,
            thumbnailSrc: "/awards-saa/thumbnails/unknown.png",
            quantityNumber: 1,
            valueAmountVnd: null,
            individualAmountVnd: null,
            collectiveAmountVnd: null,
          },
        ]}
      />,
    );

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(CATEGORIES.length);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("unknown-slug"));

    warnSpy.mockRestore();
  });
});
