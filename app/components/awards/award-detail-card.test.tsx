import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/font/google", () => ({
  Montserrat: vi.fn(() => ({ variable: "font-montserrat" })),
}));

import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import { AwardDetailCard } from "./award-detail-card";
import { buildAwardDetailEntries } from "./award-detail-data";
import { vi as viDictionary } from "@/lib/i18n/dictionaries/vi";
import { en as enDictionary } from "@/lib/i18n/dictionaries/en";

const sampleEntries = buildAwardDetailEntries(viDictionary.awards.detail);
const sampleEntry = sampleEntries[0];

describe("AwardDetailCard", () => {
  it("renders the title, full (untruncated) description, and quantity/value with labels", () => {
    const quantityLabel = viDictionary.awards.detail.quantityLabel;
    const valueLabel = viDictionary.awards.detail.valueLabel;
    render(
      <AwardDetailCard
        {...sampleEntry}
        quantityLabel={quantityLabel}
        valueLabel={valueLabel}
      />,
    );

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
    const quantityLabel = viDictionary.awards.detail.quantityLabel;
    const valueLabel = viDictionary.awards.detail.valueLabel;
    const { container } = render(
      <AwardDetailCard
        {...sampleEntry}
        quantityLabel={quantityLabel}
        valueLabel={valueLabel}
      />,
    );

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

  it("renders EN quantity/value labels with a space before the value (regression: en.ts label spacing)", () => {
    const enEntries = buildAwardDetailEntries(enDictionary.awards.detail);
    const enEntry = enEntries[0];
    const quantityLabel = enDictionary.awards.detail.quantityLabel;
    const valueLabel = enDictionary.awards.detail.valueLabel;
    render(
      <AwardDetailCard
        {...enEntry}
        quantityLabel={quantityLabel}
        valueLabel={valueLabel}
      />,
    );

    expect(
      screen.getByText(`Number of awards: ${enEntry.quantity}`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Award value: ${enEntry.value}`),
    ).toBeInTheDocument();
  });
});

describe("buildAwardDetailEntries", () => {
  it("has exactly 6 entries", () => {
    expect(sampleEntries).toHaveLength(6);
  });

  it("matches AWARD_CATEGORIES slugs, in the same order", () => {
    expect(sampleEntries.map((entry) => entry.slug)).toEqual(
      AWARD_CATEGORIES.map((category) => category.slug),
    );
  });

  it("gives every entry a non-empty title, description, quantity, and value", () => {
    for (const entry of sampleEntries) {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
      expect(entry.quantity.length).toBeGreaterThan(0);
      expect(entry.value.length).toBeGreaterThan(0);
    }
  });
});
