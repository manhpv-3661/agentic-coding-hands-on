import { describe, it, expect } from "vitest";
import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";

describe("AWARD_CATEGORIES", () => {
  it("has exactly 6 categories", () => {
    expect(AWARD_CATEGORIES).toHaveLength(6);
  });

  it("has the expected stable kebab-case slugs in order", () => {
    expect(AWARD_CATEGORIES.map((c) => c.slug)).toEqual([
      "top-talent",
      "top-project",
      "top-project-leader",
      "best-manager",
      "signature-2025-creator",
      "mvp",
    ]);
  });

  it("has the expected titles matching FR-20", () => {
    expect(AWARD_CATEGORIES.map((c) => c.title)).toEqual([
      "Top Talent",
      "Top Project",
      "Top Project Leader",
      "Best Manager",
      "Signature 2025 - Creator",
      "MVP",
    ]);
  });

  it("has unique slugs", () => {
    const slugs = AWARD_CATEGORIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has only kebab-case slugs (lowercase letters, digits, hyphens)", () => {
    for (const category of AWARD_CATEGORIES) {
      expect(category.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });
});
