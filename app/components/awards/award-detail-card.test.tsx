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
    // Quantity label (24px gold) and the quantity figure/unit-caption pair
    // (36px hero number + 14px caption, per MoMorph ground truth) render as
    // separate elements rather than one uniform 24px line — assert on each
    // tier independently. The data model already carries these pre-split
    // (`AwardMetric`), so there's no runtime string to split here anymore.
    expect(screen.getByText(quantityLabel.trim())).toBeInTheDocument();
    expect(screen.getByText(sampleEntry.quantity.number)).toBeInTheDocument();
    if (sampleEntry.quantity.unit) {
      expect(screen.getByText(sampleEntry.quantity.unit)).toBeInTheDocument();
    }
    // Same for the value label (24px gold) vs. the value figure/unit pair
    // (36px amount + 14px unit caption).
    expect(screen.getByText(valueLabel.trim())).toBeInTheDocument();
    expect(screen.getByText(sampleEntry.value!.number)).toBeInTheDocument();
    if (sampleEntry.value!.unit) {
      expect(screen.getByText(sampleEntry.value!.unit)).toBeInTheDocument();
    }
  });

  it("renders the entry's own per-award thumbnail (background + name pre-composited), with alt = title", () => {
    const quantityLabel = viDictionary.awards.detail.quantityLabel;
    const valueLabel = viDictionary.awards.detail.valueLabel;
    render(
      <AwardDetailCard
        {...sampleEntry}
        quantityLabel={quantityLabel}
        valueLabel={valueLabel}
      />,
    );

    const thumbnail = screen.getByAltText(sampleEntry.title);
    expect(thumbnail).toHaveAttribute(
      "src",
      expect.stringContaining(encodeURIComponent(sampleEntry.titleImageSrc)),
    );
  });

  it("renders EN quantity/value labels and split figures correctly (regression: en.ts label spacing)", () => {
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

    // Labels keep their own trailing space (`"Number of awards: "`) — the
    // visual gap before the figure now comes from flex `gap-4` rather than
    // from label+value sharing one text node, but the label string itself
    // must still render intact.
    expect(screen.getByText(quantityLabel.trim())).toBeInTheDocument();
    expect(screen.getByText(valueLabel.trim())).toBeInTheDocument();
    expect(screen.getByText(enEntry.quantity.number)).toBeInTheDocument();
    if (enEntry.quantity.unit) {
      expect(screen.getByText(enEntry.quantity.unit)).toBeInTheDocument();
    }
    expect(screen.getByText(enEntry.value!.number)).toBeInTheDocument();
    if (enEntry.value!.unit) {
      expect(screen.getByText(enEntry.value!.unit)).toBeInTheDocument();
    }
  });

  it("renders Signature 2025 - Creator's two value rows (individual/collective) split by the orLabel divider, not one concatenated value", () => {
    const quantityLabel = viDictionary.awards.detail.quantityLabel;
    const valueLabel = viDictionary.awards.detail.valueLabel;
    const signatureEntry = sampleEntries.find(
      (entry) => entry.slug === AWARD_CATEGORIES[4].slug,
    )!;

    render(
      <AwardDetailCard
        {...signatureEntry}
        quantityLabel={quantityLabel}
        valueLabel={valueLabel}
      />,
    );

    const { individualValue, individualSuffix, collectiveValue, collectiveSuffix } =
      viDictionary.awards.detail.entries.signatureCreator;

    expect(screen.getByText(individualValue)).toBeInTheDocument();
    expect(screen.getByText(individualSuffix)).toBeInTheDocument();
    expect(screen.getByText(collectiveValue)).toBeInTheDocument();
    expect(screen.getByText(collectiveSuffix)).toBeInTheDocument();
    expect(screen.getByText(viDictionary.awards.detail.orLabel)).toBeInTheDocument();
    // The old collapsed single-value sentence must not render anywhere.
    expect(screen.queryByText(/HOẶC/)).not.toBeInTheDocument();
  });

  it("defaults to image-left (no `lg:flex-row-reverse`) when `imageSide` is omitted", () => {
    const quantityLabel = viDictionary.awards.detail.quantityLabel;
    const valueLabel = viDictionary.awards.detail.valueLabel;
    const { container } = render(
      <AwardDetailCard
        {...sampleEntry}
        quantityLabel={quantityLabel}
        valueLabel={valueLabel}
      />,
    );

    const card = container.querySelector(`[data-award-slug="${sampleEntry.slug}"]`);
    expect(card?.className).not.toContain("lg:flex-row-reverse");
  });

  it('applies `lg:flex-row-reverse` (image right) when `imageSide="right"` (D.2/D.4/D.6)', () => {
    const quantityLabel = viDictionary.awards.detail.quantityLabel;
    const valueLabel = viDictionary.awards.detail.valueLabel;
    const { container } = render(
      <AwardDetailCard
        {...sampleEntry}
        quantityLabel={quantityLabel}
        valueLabel={valueLabel}
        imageSide="right"
      />,
    );

    const card = container.querySelector(`[data-award-slug="${sampleEntry.slug}"]`);
    expect(card?.className).toContain("lg:flex-row-reverse");
  });

  it('does not add `lg:flex-row-reverse` when `imageSide="left"` is explicit (D.1/D.3/D.5)', () => {
    const quantityLabel = viDictionary.awards.detail.quantityLabel;
    const valueLabel = viDictionary.awards.detail.valueLabel;
    const { container } = render(
      <AwardDetailCard
        {...sampleEntry}
        quantityLabel={quantityLabel}
        valueLabel={valueLabel}
        imageSide="left"
      />,
    );

    const card = container.querySelector(`[data-award-slug="${sampleEntry.slug}"]`);
    expect(card?.className).not.toContain("lg:flex-row-reverse");
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

  it("gives every entry a non-empty title, description, and quantity number, plus either a `value` or `valueVariants`", () => {
    for (const entry of sampleEntries) {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
      // `unit` may legitimately be "" (e.g. MVP's bare quantity "01"), but
      // `number` is always required.
      expect(entry.quantity.number.length).toBeGreaterThan(0);
      if (entry.valueVariants) {
        expect(entry.valueVariants.orLabel.length).toBeGreaterThan(0);
        expect(entry.valueVariants.individual.value.length).toBeGreaterThan(0);
        expect(entry.valueVariants.individual.suffix.length).toBeGreaterThan(0);
        expect(entry.valueVariants.collective.value.length).toBeGreaterThan(0);
        expect(entry.valueVariants.collective.suffix.length).toBeGreaterThan(0);
      } else {
        expect(entry.value?.number.length).toBeGreaterThan(0);
      }
    }
  });

  it("gives Signature 2025 - Creator a dual valueVariants structure instead of a single value", () => {
    const signatureEntry = sampleEntries.find(
      (entry) => entry.slug === AWARD_CATEGORIES[4].slug,
    );
    expect(signatureEntry?.value).toBeUndefined();
    expect(signatureEntry?.valueVariants).toEqual({
      orLabel: viDictionary.awards.detail.orLabel,
      individual: {
        value: viDictionary.awards.detail.entries.signatureCreator.individualValue,
        suffix: viDictionary.awards.detail.entries.signatureCreator.individualSuffix,
      },
      collective: {
        value: viDictionary.awards.detail.entries.signatureCreator.collectiveValue,
        suffix: viDictionary.awards.detail.entries.signatureCreator.collectiveSuffix,
      },
    });
  });
});
