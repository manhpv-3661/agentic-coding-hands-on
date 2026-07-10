import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/font/google", () => ({
  Montserrat: vi.fn(() => ({ variable: "font-montserrat" })),
}));

vi.mock("next/font/local", () => ({
  default: vi.fn(() => ({ className: "font-digital-numbers" })),
}));

vi.mock("@/hooks/use-scroll-spy", () => ({
  useScrollSpy: vi.fn(),
}));

import { AwardsCatalog } from "./awards-catalog";
import { buildAwardDetailEntries } from "./award-detail-data";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import { AWARD_CATEGORY_FALLBACK_ROWS } from "@/lib/awards/award-categories-fallback";
import { vi as viDictionary } from "@/lib/i18n/dictionaries/vi";

const entries = buildAwardDetailEntries(
  AWARD_CATEGORY_FALLBACK_ROWS,
  viDictionary.awards.detail,
  "vi",
);
const quantityLabel = viDictionary.awards.detail.quantityLabel;
const valueLabel = viDictionary.awards.detail.valueLabel;

describe("AwardsCatalog", () => {
  it("defaults the first category active when the scroll-spy hook has not intersected yet (top of page)", () => {
    vi.mocked(useScrollSpy).mockReturnValue(null);

    render(
      <AwardsCatalog entries={entries} quantityLabel={quantityLabel} valueLabel={valueLabel} />,
    );

    const firstCategory = AWARD_CATEGORIES[0];
    const activeLink = screen.getByRole("link", { name: firstCategory.title });
    expect(activeLink).toHaveAttribute("aria-current", "true");

    AWARD_CATEGORIES.slice(1).forEach((category) => {
      expect(
        screen.getByRole("link", { name: category.title }),
      ).not.toHaveAttribute("aria-current");
    });
  });

  it("passes through the scroll-spy's active slug once a section has intersected", () => {
    const activeCategory = AWARD_CATEGORIES[2];
    vi.mocked(useScrollSpy).mockReturnValue(activeCategory.slug);

    render(
      <AwardsCatalog entries={entries} quantityLabel={quantityLabel} valueLabel={valueLabel} />,
    );

    expect(
      screen.getByRole("link", { name: activeCategory.title }),
    ).toHaveAttribute("aria-current", "true");
    expect(
      screen.getByRole("link", { name: AWARD_CATEGORIES[0].title }),
    ).not.toHaveAttribute("aria-current");
  });

  it("alternates each card's image side left/right by position (D.1 left, D.2 right, D.3 left, ...)", () => {
    vi.mocked(useScrollSpy).mockReturnValue(null);

    const { container } = render(
      <AwardsCatalog entries={entries} quantityLabel={quantityLabel} valueLabel={valueLabel} />,
    );

    entries.forEach((entry, index) => {
      const card = container.querySelector(`[data-award-slug="${entry.slug}"]`);
      expect(card).not.toBeNull();

      const expectsReversed = index % 2 === 1;
      if (expectsReversed) {
        expect(card?.className).toContain("flex-row-reverse");
      } else {
        expect(card?.className).not.toContain("flex-row-reverse");
      }
    });
  });
});
