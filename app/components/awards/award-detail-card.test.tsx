import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/font/google", () => ({
  Montserrat: vi.fn(() => ({ variable: "font-montserrat" })),
}));

import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import { AwardDetailCard } from "./award-detail-card";
import { AWARD_DETAIL_ENTRIES } from "./award-detail-data";

const sampleEntry = AWARD_DETAIL_ENTRIES[0];

describe("AwardDetailCard", () => {
  it("renders the title, full (untruncated) description, and quantity/value with labels", () => {
    render(<AwardDetailCard {...sampleEntry} />);

    expect(
      screen.getByRole("heading", { level: 3, name: sampleEntry.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(sampleEntry.description)).toBeInTheDocument();
    expect(
      screen.getByText(`Số lượng giải thưởng: ${sampleEntry.quantity}`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Giá trị giải thưởng: ${sampleEntry.value}`),
    ).toBeInTheDocument();
  });

  it("uses the shared Award-BG.png background and the entry's own title overlay image, with alt = title", () => {
    const { container } = render(<AwardDetailCard {...sampleEntry} />);

    const backgroundLayer = container.querySelector(
      '[style*="Award-BG.png"]',
    );
    expect(backgroundLayer).not.toBeNull();

    const overlayImage = screen.getByAltText(sampleEntry.title);
    expect(overlayImage).toHaveAttribute(
      "src",
      expect.stringContaining(encodeURIComponent(sampleEntry.titleImageSrc)),
    );
  });
});

describe("AWARD_DETAIL_ENTRIES", () => {
  it("has exactly 6 entries", () => {
    expect(AWARD_DETAIL_ENTRIES).toHaveLength(6);
  });

  it("matches AWARD_CATEGORIES slugs, in the same order", () => {
    expect(AWARD_DETAIL_ENTRIES.map((entry) => entry.slug)).toEqual(
      AWARD_CATEGORIES.map((category) => category.slug),
    );
  });

  it("gives every entry a non-empty title, description, quantity, and value", () => {
    for (const entry of AWARD_DETAIL_ENTRIES) {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
      expect(entry.quantity.length).toBeGreaterThan(0);
      expect(entry.value.length).toBeGreaterThan(0);
    }
  });
});
