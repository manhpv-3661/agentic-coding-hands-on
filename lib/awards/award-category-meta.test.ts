import { describe, expect, it, vi } from "vitest";
import { AWARD_CATEGORY_TITLES, resolveAwardCategoryMeta } from "./award-category-meta";

/**
 * Locks in the shared per-slug title map + guard helper extracted from the
 * two previously-duplicated maps (`award-detail-data.ts`'s old
 * `CATEGORY_META` and `home/awards-section.tsx`'s `AWARD_CARD_META`) —
 * plans/260709-1710-ui-refactor-cleanup/phase-03-awards-components-dedup.md.
 * Every title below is copied verbatim from those two prior maps.
 */
describe("AWARD_CATEGORY_TITLES", () => {
  const expectedTitles: Record<string, string> = {
    "top-talent": "Top Talent",
    "top-project": "Top Project",
    "top-project-leader": "Top Project Leader",
    "best-manager": "Best Manager",
    "signature-2025-creator": "Signature 2025 - Creator",
    mvp: "MVP (Most Valuable Person)",
  };

  it.each(Object.entries(expectedTitles))(
    "resolves slug %s to the exact prior title %s",
    (slug, expectedTitle) => {
      expect(AWARD_CATEGORY_TITLES[slug]).toBe(expectedTitle);
    },
  );

  it("has exactly the 6 known award slugs (no drift/extra entries)", () => {
    expect(Object.keys(AWARD_CATEGORY_TITLES).sort()).toEqual(
      Object.keys(expectedTitles).sort(),
    );
  });
});

describe("resolveAwardCategoryMeta", () => {
  const sampleMeta: Readonly<Record<string, { dictEntryKey: string }>> = {
    "top-talent": { dictEntryKey: "topTalent" },
  };

  it("returns the meta entry for a known slug", () => {
    const result = resolveAwardCategoryMeta("top-talent", sampleMeta, "test-caller");
    expect(result).toEqual({ dictEntryKey: "topTalent" });
  });

  it("returns undefined and warns (skip-and-warn guard) for an unknown slug", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = resolveAwardCategoryMeta("unknown-slug", sampleMeta, "test-caller");

    expect(result).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("test-caller"),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("unknown-slug"),
    );

    warnSpy.mockRestore();
  });
});
