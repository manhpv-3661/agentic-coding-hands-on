import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { AwardsNavMenu } from "./awards-nav-menu";
import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";

describe("AwardsNavMenu", () => {
  it("renders all categories in order with `#<slug>` hrefs (FR-6, FR-7)", () => {
    render(<AwardsNavMenu items={AWARD_CATEGORIES} activeSlug={null} />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(AWARD_CATEGORIES.length);

    links.forEach((link, index) => {
      const category = AWARD_CATEGORIES[index];
      expect(link).toHaveAttribute("href", `#${category.slug}`);
      expect(link).toHaveTextContent(category.title);
    });
  });

  it("marks only the item matching `activeSlug` as active (FR-8)", () => {
    const activeCategory = AWARD_CATEGORIES[2];
    render(<AwardsNavMenu items={AWARD_CATEGORIES} activeSlug={activeCategory.slug} />);

    const activeLink = screen.getByRole("link", { name: activeCategory.title });
    expect(activeLink).toHaveAttribute("aria-current", "true");
    expect(activeLink.className).toContain("underline");
    expect(activeLink.className).toContain("text-[#FFEA9E]");

    AWARD_CATEGORIES.filter((c) => c.slug !== activeCategory.slug).forEach((category) => {
      const link = screen.getByRole("link", { name: category.title });
      expect(link).not.toHaveAttribute("aria-current");
      expect(link.className).not.toContain("underline");
    });
  });

  it("highlights nothing and does not throw when `activeSlug` is null or unknown (FR-10)", () => {
    expect(() =>
      render(<AwardsNavMenu items={AWARD_CATEGORIES} activeSlug={null} />),
    ).not.toThrow();
    AWARD_CATEGORIES.forEach((category) => {
      expect(screen.getByRole("link", { name: category.title })).not.toHaveAttribute(
        "aria-current",
      );
    });

    expect(() =>
      render(<AwardsNavMenu items={AWARD_CATEGORIES} activeSlug="not-a-real-slug" />),
    ).not.toThrow();
  });
});
